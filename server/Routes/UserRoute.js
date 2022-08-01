import express from 'express';
import { deleteUser, follower, getUser, unfollower, updateUser } from '../Controllers/UserController.js';

const router = express.Router();

router.get('/:id',getUser)
router.put('/:id',updateUser)
router.delete('/:id',deleteUser)
router.put('/:id/follow',follower)
router.put('/:id/unfollow',unfollower)
export default router;