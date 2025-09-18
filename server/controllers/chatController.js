import pool from "../db.js";

export const sendMessage = async (req, res) => {
  const senderId = req.user.id;
  const { receiverId, messageText } = req.body;

  if (!messageText || messageText.trim() === "") {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  try {
    const receiverResult = await pool.query(
      "SELECT id, neighborhood_id FROM users WHERE id = $1",
      [receiverId]
    );

    if (receiverResult.rows.length === 0) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const receiverNeighborhood = receiverResult.rows[0].neighborhood_id;
    if (receiverNeighborhood !== req.user.neighborhood_id) {
      return res
        .status(403)
        .json({ message: "User is not in your neighborhood" });
    }

    let conversationResult = await pool.query(
      `SELECT id FROM conversations 
       WHERE (user1_id=$1 AND user2_id=$2) OR (user1_id=$2 AND user2_id=$1)`,
      [senderId, receiverId]
    );

    let conversationId;
    if (conversationResult.rows.length === 0) {
      const insertConv = await pool.query(
        `INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING id`,
        [senderId, receiverId]
      );
      conversationId = insertConv.rows[0].id;
    } else {
      conversationId = conversationResult.rows[0].id;
    }

    const messageInsert = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, receiver_id, message_text) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [conversationId, senderId, receiverId, messageText.trim()]
    );

    await pool.query(
      `UPDATE conversations SET last_message_time = NOW() WHERE id = $1`,
      [conversationId]
    );

    res
      .status(201)
      .json({ message: "Message sent", data: messageInsert.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
};

export const getMessages = async (req, res) => {
  const userId = req.user.id;
  const { conversationId } = req.params;
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const convResult = await pool.query(
      `SELECT * FROM conversations WHERE id=$1 AND (user1_id=$2 OR user2_id=$2)`,
      [conversationId, userId]
    );

    if (convResult.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "Access denied to this conversation" });
    }

    const messagesResult = await pool.query(
      `
      SELECT * FROM (
        SELECT * 
        FROM messages
        WHERE conversation_id=$1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      ) sub
      ORDER BY created_at ASC
      `,
      [conversationId, limit, offset]
    );

    res.status(200).json({ messages: messagesResult.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
};

export const listConversations = async (req, res) => {
  const userId = req.user.id;
  try {
    const convResult = await pool.query(
      `SELECT c.*, u1.full_name AS user1_name, u1.profile_pic AS u1_pic , u2.full_name AS user2_name, u2.profile_pic AS u2_pic,
        (SELECT message_text FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message
       FROM conversations c
       JOIN users u1 ON u1.id = c.user1_id
       JOIN users u2 ON u2.id = c.user2_id
       WHERE c.user1_id=$1 OR c.user2_id=$1
       ORDER BY c.last_message_time DESC`,
      [userId]
    );

    res.status(200).json({ conversations: convResult.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
};

export const markAsRead = async (req, res) => {
  const userId = req.user.id;
  const messageId = req.params.messageId;

  try {
    const messageResult = await pool.query(
      `SELECT * FROM messages WHERE id=$1`,
      [messageId]
    );

    if (messageResult.rows.length === 0) {
      return res.status(404).json({ message: "Message not found" });
    }

    const message = messageResult.rows[0];
    if (message.receiver_id !== userId) {
      return res
        .status(403)
        .json({ message: "You cannot mark this message as read" });
    }

    await pool.query(`UPDATE messages SET read_at=NOW() WHERE id=$1`, [
      messageId,
    ]);

    res.status(200).json({ message: "Message marked as read" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
};
