//@ts-check
import express, { Request, Response } from 'express';
import auth from '../../middleware/auth';
import { check, validationResult } from 'express-validator';
import { Item, ItemDocument } from '../../models/Item';

const router = express.Router();

// @route   GET api/items/
// @desc    Get all items
// @acces   Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const items = await Item.find().populate('item', [
      'name, category, price, comments',
    ]);
    res.json(items);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/items/:item_id
// @desc    Get item Id
// @acces   Public
router.get('/:item_id', async (req: Request, res: Response) => {
  try {
    const item = await Item.findOne({
      _id: req.params.item_id,
    }).populate('item', ['name, category, price, comments']);

    if (!item) {
      return res.status(400).json({ errors: [{ msg: 'Item not found' }] });
    }

    res.json(item);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ errors: [{ msg: 'Item not found' }] });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/items
// @desc    Add items by admin
// @acces   Private
router.post(
  '/',
  [
    auth,
    check('name', 'Name is required').not().isEmpty(),
    check('category', 'At least one category is required').not().isEmpty(),
    check('price', 'Price is required').not().isEmpty(),
    check('comments', 'Comments slots are required').not().isEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    try {
      const items = await Item.find().populate('item', [
        'name, category, price, comments',
      ]);
      const { name, category, price, comments } = <ItemDocument>req.body;

      // @ts-ignore
      const categoryArray: string[] = await category.split(',');

      let trimmedArray: string[] = [];

      categoryArray.map((e: string) => {
        trimmedArray.push(e.trim());
      });

      const newItem = new Item({
        name,
        category: trimmedArray,
        price,
        comments,
      });

      newItem.save();
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/items/delete/:item_id
// @desc    Delete experience from profile
// @acces   Private
router.delete('/:item_id', auth, async (req: Request, res: Response) => {
  try {
    const items = await Item.find().populate('item', [
      'name, category, price, comments',
    ]);

    const itemIndex = await items
      .map(item => item.id)
      .indexOf(req.params.item_id);

    if (itemIndex < 0) {
      return res.status(400).json({ errors: [{ msg: 'Item does not exist' }] });
    } else {
      await Item.findOneAndRemove({ _id: items[itemIndex].id });
    }

    await res.json({ msg: 'Item removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/items/comment/:item_id
// @desc    Add comment to item
// @acces   Private
router.put(
  '/comment/:item_id',
  [auth, check('rating', 'Rating is required').not().isEmpty()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const item = await Item.findOne({ _id: req.params.item_id });

      const newComment = {
        user: req.user!.username,
        rating: req.body.rating,
        text: <string>req.body.text,
        date: Date.now(),
      };

      if (item !== null) {
        item.comments.unshift(newComment);
        await item.save();
        return res.json(item.comments);
      } else {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Item does not exist' }] });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/items/comment/:item_id/:comment_id
// @desc    Delete comment from an item
// @acces   Private
router.delete(
  '/comment/:item_id/:comment_id',
  auth,
  async (req: Request, res: Response) => {
    try {
      const item = await Item.findOne({ _id: req.params.item_id });

      if (item !== null) {
        const removeIndex = await item.comments
          .map(comment => comment.id)
          .indexOf(req.params.comment_id);
        item.comments.splice(removeIndex, 1);
        await item.save();
        res.json(item.comments);
      } else {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Item does not exist' }] });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

export = router;
