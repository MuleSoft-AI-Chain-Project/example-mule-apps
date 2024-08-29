import React from "react";

type TokenInfo = {
    inputCount: number;
    outputCount: number;
    totalCount: number;
};

interface TokenUsageTableProps {
    tokenUsage: Record<string, TokenInfo>;
}

const TokenUsageTable: React.FC<TokenUsageTableProps> = ({ tokenUsage }) => {
    const users = Object.keys(tokenUsage);

    if (users.length === 0) {
        return <p className="text-sm text-gray-500">No token usage data available.</p>;
    }

    return (
        <table className="min-w-full bg-white border border-gray-200 mt-4">
            <thead>
                <tr>
                    <th className="py-2 px-4 border-b">User</th>
                    <th className="py-2 px-4 border-b">Input Tokens</th>
                    <th className="py-2 px-4 border-b">Output Tokens</th>
                    <th className="py-2 px-4 border-b">Total Tokens</th>
                </tr>
            </thead>
            <tbody>
                {users.map((userName) => (
                    <tr key={userName}>
                        <td className="py-2 px-4 border-b">{userName}</td>
                        <td className="py-2 px-4 border-b">{tokenUsage[userName].inputCount}</td>
                        <td className="py-2 px-4 border-b">{tokenUsage[userName].outputCount}</td>
                        <td className="py-2 px-4 border-b">{tokenUsage[userName].totalCount}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TokenUsageTable;