import { sql } from "../config/db.js";

export async function getTransactionsByUserId(req, res) {
  try {
    const { userId } = req.params;

    const transactions =
      await sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC`;

    console.log("transactions", transactions);

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createTransaction(req, res) {
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || amount === undefined || !category || !user_id) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const [transaction] =
      await sql`INSERT INTO transactions(user_id, title, amount, category) VALUES(${user_id}, ${title}, ${amount}, ${category}) RETURNING *`;

    res
      .status(201)
      .json({ message: "Transaction created successfully", transaction });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
      res.status(400).json({ error: "Invalid transaction ID" });
      return;
    }

    const [transaction] =
      await sql`DELETE FROM transactions WHERE id = ${id} RETURNING *`;

    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Transaction deleted successfully", transaction });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getTransactionSummary(req, res) {
  try {
    const { userId } = req.params;

    const balanceResult =
      await sql`SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE user_id = ${userId}`;

    const incomeResult =
      await sql`SELECT COALESCE(SUM(amount), 0) as income FROM transactions WHERE user_id = ${userId} AND amount > 0`;

    const expensesResult =
      await sql`SELECT COALESCE(SUM(amount), 0) as expenses FROM transactions WHERE user_id = ${userId} AND amount < 0`;

    console.log("balanceResult", balanceResult);
    console.log("incomeResult", incomeResult);
    console.log("expensesResult", expensesResult);

    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expenses: expensesResult[0].expenses,
    });
  } catch (error) {
    console.error("Error getting summary transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
