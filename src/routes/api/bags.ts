import express, { Request, Response } from 'express';
import auth from '../../middleware/auth';

import { check, validationResult } from 'express-validator';
import { Bag } from '../../models/Bag';
import { User, UserDocument } from '../../models/User';

const router = express.Router();

// @route   GET api/my-bag
// @desc    Get current user bag
// @acces   Private
router.get('/', async (req, res) => {
  try {
    const user = await User.findOne(req.user).select('-password');

    let bag = await Bag.findOne({ owner: user!.id });

    if (!bag) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'There is no bag associated to this user' }] });
    }

    res.json(bag);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/my-bag
// @desc    Create or Update user's bag
// @acces   Private
router.post('/', auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user!.id).select('-password');

    const { id, username } = <UserDocument>user;

    let bag = await Bag.findOne({ owner: user!.id });

    const bagFields = {
      user: username,
    };

    if (bag) {
      //Update bag
      bag = await Bag.findOneAndUpdate(
        { owner: user!.id },
        { $set: bagFields },
        { new: true }
      );
      return res.json(bag);
    }

    //Create bag
    bag = new Bag({ owner: id, user: username });
    await bag.save();
    res.json(bag);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/my-bag
// @desc    Delete bag & user
// @acces   Private
router.delete('/', auth, async (req, res) => {
  try {
    //Remove User
    await User.findOneAndRemove({ _id: req.user!.id });

    //Remove profile
    await Bag.findOneAndRemove({ user: req.user!.id });

    res.json({ msg: 'User deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/my-bag/item/:item_id
// @desc    Add items to cart
// @acces   Private
router.put('/item/:item_id', auth, async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  }

  try {
    const bag = await Bag.findOne({ owner: req.user!.id });
    if (bag !== undefined || bag !== null) {
      bag!.items.unshift(req.params.item_id.toString());
      await bag!.save();
      return res.json(bag);
    }

    return res
      .status(400)
      .json({ errors: [{ msg: 'User bag does not exist' }] });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/my-bag/:item_id
// @desc    Delete item from bag
// @acces   Private
router.delete('/:item_id', auth, async (req, res) => {
  try {
    const bag = await Bag.findOne({ owner: req.user!.id });

    const removeIndex = await bag!.items
      .map(item => item)
      .indexOf(req.params.item_id);

    if (removeIndex !== undefined) bag!.items.splice(removeIndex, 1);

    await bag!.save();

    res.json(bag);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

export = router;
