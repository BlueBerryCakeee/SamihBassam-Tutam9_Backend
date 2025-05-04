import express from 'express';
import Todo from '../models/todoModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply the auth middleware to all todo routes
router.use(protect);

// Get all todos for the authenticated user
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a todo for the authenticated user
router.post('/', async (req, res) => {
  const todo = new Todo({
    title: req.body.title,
    completed: req.body.completed || false,
    user: req.user._id,
    dueDate: req.body.dueDate || null
  });

  try {
    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a todo (only if it belongs to the authenticated user)
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a todo (only if it belongs to the authenticated user)
router.patch('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    const updates = {};
    if (req.body.completed !== undefined) updates.completed = req.body.completed;
    if (req.body.dueDate !== undefined) updates.dueDate = req.body.dueDate;
    
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true }
    );
    
    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
