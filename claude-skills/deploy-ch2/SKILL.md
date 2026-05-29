---
name: deploy-ch2
description: Deploy a Mule application to CloudHub 2.0. Packages the project (or uses an Exchange asset), uploads to a target environment, and starts it with configurable replicas/vCores, secure mode, and performance optimization. Use when the user says "deploy to CloudHub 2.0", "deploy this app", "push to CH2", or after implementing an API and wanting to go live.
---

# Deploy to CloudHub 2.0

Deploys a Mule application to CloudHub 2.0 using the `mcp__mulesoft__deploy_mule_application` tool. Supports deploying from a local project or a published Exchange asset.

## Inputs needed
- **Source** — either:
  - Local project path (an absolute path to a Mule project root containing `pom.xml`), OR
  - Exchange asset (`groupId`, `assetId` / `artifactId`, `version`)
  - Default: most recently worked-on impl project.
- **App name** — default `<artifactId>` (derived from project `pom.xml`). Confirm if unclear.
- **Environment** — default **Sandbox**. Ask if unclear (other common: `DEV`, `QA`, `Production`).
- **Runtime version** — from `pom.xml` `<app.runtime>`. Verify via MCP that it's still current; flag if stale.
- **Replicas** — default `1`. Ask for more only if the user mentions HA or traffic.
- **vCores per replica** — default `0.1`. Ask if the user mentions throughput, memory concerns, or specific sizing.
- **High availability / secure / performance optimization** — default all `false`. Ask only if context suggests production.
- **Properties** — cleartext and secure properties must already be set in `pom.xml` under `<cloudhub2Deployment>` or passed via Maven `-D` flags. Flag any `REPLACE_WITH_*` placeholders in `config.yaml` / `application.properties`.

If critical info is missing, ask concisely with suggested defaults.

## Pre-flight checks (do not skip)
Run these before calling the deploy tool. If any fails, stop and report — do not deploy a broken app.

1. **Project packages cleanly**
   - Run `mvn -B -f <project>/pom.xml clean package -DskipTests` with `JAVA_HOME` pointing at a JDK 17 install (any distribution: Zulu, Temurin, Corretto, etc.).
   - Must produce `target/<artifactId>-<version>-mule-application.jar`.
2. **POM has `<cloudhub2Deployment>` configured** (not `<cloudHubDeployment>` or `<rtfDeployment>`). If missing, stop and instruct user to add it.
3. **No cleartext secrets in `config.yaml` / `application.properties`** — warn if placeholder strings like `REPLACE_WITH_*`, `your-domain`, `example.com`, or obvious test tokens are present. Ask the user to confirm before proceeding.
4. **Runtime version is current** — compare POM `<app.runtime>` against MCP-reported latest. If a major LTS has been released since, flag it as an upgrade opportunity (do not silently bump).
5. **App name is unique in target environment** — call `mcp__mulesoft__list_applications` and warn if a same-named app already exists (deploy will redeploy/replace).

## Confirmation checkpoint (do not skip)
Before calling the deploy tool, show the user:
- Source (local path or Exchange coords)
- Target environment
- App name
- Runtime version
- Replicas × vCores
- High availability / secure / performance optimization flags
- Any placeholder/secret warnings from pre-flight

Get explicit confirmation. Deploys are visible to others in the org and costs vCore-hours — do not skip this checkpoint.

## Deploy
Call `mcp__mulesoft__deploy_mule_application` with the confirmed inputs.

- **Local project deploy** — pass `projectPath`, `appName`, `environmentName`, `runtimeVersion`, `minimumReplicas`, optional flags.
- **Exchange asset deploy** — pass `groupId`, `artifactId`, `version`, `appName`, `environmentName`, `runtimeVersion`, `minimumReplicas`, optional flags.

## Post-deploy
1. Call `mcp__mulesoft__list_applications` for the target environment to confirm the app shows `STARTED` / `RUNNING`.
2. If the app has an HTTP listener, report the CH 2.0 public URL pattern: `https://<app-name>.<region>.cloudhub.io/` (exact region depends on the deployment target).
3. If status is `DEPLOY_FAILED` or stuck, pull logs via `list_applications` with `includeLogs=true, logLevel=ERROR` and report the first error.

## Report back
- App name + environment
- Status (from `list_applications`)
- Public URL if applicable
- Replicas × vCores deployed
- Runtime version deployed
- Any warnings from pre-flight that the user acknowledged
- Next steps: smoke-test the public URL, set up monitoring/alerting if not already configured

## Rules
- **CloudHub 2.0 only** — never CH 1.0 or RTF. If the POM targets those, stop and offer migration.
- **Java 17** for the local `mvn package` step — set `JAVA_HOME` explicitly (do not let the shell's default JDK win if it's a different version).
- **Do not silently bump the runtime version** — flag upgrade opportunities but require explicit user opt-in.
- **Warn before overwriting existing deployed apps** — same `appName` in the same env will redeploy.
- **Never deploy with placeholder credentials** — pre-flight must catch and warn.
- Default environment is **Sandbox** unless the user specifies otherwise; for `Production`, require explicit confirmation and recommend `highAvailability=true` + `minimumReplicas>=2`.

## Example
> Deploy jira-tickets-api-impl to Sandbox

1. Pre-flight: package with JDK 17 → verify `<cloudhub2Deployment>` → scan `config.yaml` (flag any `ATATT*` token in cleartext → warn user) → check runtime 4.11.2 is current → check no existing `jira-tickets-api-impl` in Sandbox.
2. Confirm with user: Sandbox / 1 replica / 0.1 vCores / runtime 4.11.2 / no HA.
3. Call `mcp__mulesoft__deploy_mule_application` with `projectPath`, `appName="jira-tickets-api-impl"`, `environmentName="Sandbox"`, `minimumReplicas=1`, `runtimeVersion="4.11.2"`.
4. Poll `list_applications` until `STARTED` or error.
5. Report URL `https://jira-tickets-api-impl.<region>.cloudhub.io/api/tickets/...` and next steps.
