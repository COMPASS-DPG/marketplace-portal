
export class TransactionResponse {
    
    readonly transactionId: number;
    readonly fromId: number;
    readonly toId: number;
    readonly credits: number;
    readonly type: TransactionType;
    readonly description: string | null;
    readonly createdAt: Date;
}

export type TransactionType = "purchase" | "creditRequest" | "settlement";