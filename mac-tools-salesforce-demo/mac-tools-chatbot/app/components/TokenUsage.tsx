import React from "react";

// Define the TokenInfo type
type TokenInfo = {
    inputCount: number;
    outputCount: number;
    totalCount: number;
};

// Define the props for the TokenUsageTable component
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
                {users.map((user) => (
                    <tr key={user}>
                        <td className="py-2 px-4 border-b">{user}</td>
                        <td className="py-2 px-4 border-b">{tokenUsage[user].inputCount}</td>
                        <td className="py-2 px-4 border-b">{tokenUsage[user].outputCount}</td>
                        <td className="py-2 px-4 border-b">{tokenUsage[user].totalCount}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TokenUsageTable;
