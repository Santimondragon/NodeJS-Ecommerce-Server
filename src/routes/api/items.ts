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
      'name, image, category, material, price',
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
    }).populate('item', ['name, image, category, material, price']);

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
    check('image', 'Image is required').not().isEmpty(),
    check('category', 'At least one category is required').not().isEmpty(),
    check('material', 'At least one material is required').not().isEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    try {
      const items = await Item.find().populate('item', [
        'name, image, category, material, price',
      ]);
      const { name, image, category, material, price } = <ItemDocument>req.body;

      // @ts-ignore
      const categoryArray: string[] = await category.split(',');
      // @ts-ignore
      const materialArray: string[] = await material.split(',');

      //@ts-check
      categoryArray.map((e: string) => e.trim());
      materialArray.map((e: string) => e.trim());

      const newItem = new Item({
        name,
        image,
        category: categoryArray,
        material: materialArray,
      });
      await newItem.save();
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
      'name, image, category, material, price',
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

// @route   PUT api/items/rating/:item_id
// @desc    Add rating to item
// @acces   Private
router.put(
  '/rating/:item_id',
  [auth, check('rating', 'Rate is required').not().isEmpty()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const items = await Item.find().populate('item', [
        'name, image, category, material, price',
      ]);
      const item = await Item.findOne({ _id: req.params.item_id });

      const itemIndex = await items
        .map(item => item.id)
        .indexOf(req.params.item_id);

      if (!item || itemIndex < 0) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Item does not exist' }] });
      }

      const rated =
        (await items[itemIndex].rating.filter(
          rate => rate.user.toString() === req.user!.id
        ).length) > 0;

      const newRating = {
        user: req.user!.id,
        rating: req.body.rating,
      };

      if (rated) {
        const others = await item.rating.filter(
          rate => rate.user.toString() !== req.user!.id
        );
        item.rating = [...others, newRating];
      } else {
        item.rating.unshift(newRating);
      }
      item.save();
      res.json(item.rating);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/items/comment/:item_id
// @desc    Add comment to item
// @acces   Private
router.put(
  '/comment/:item_id',
  [auth, check('text', 'Text is required').not().isEmpty()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const item = await Item.findOne({ _id: req.params.item_id });

      const newComment = {
        user: req.user!.id,
        name: req.user!.name,
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

// @route   PUT api/items/comment/like/:item_id/:comment
// @desc    Add like to item comment
// @acces   Private
router.put(
  '/comment/like/:item_id/:comment_id',
  auth,
  async (req: Request, res: Response) => {
    try {
      const item = await Item.findOne({ _id: req.params.item_id });

      if (item === undefined || item === null) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Item does not exist' }] });
      } else {
        const commentIndex = await item.comments
          .map(comment => comment.id)
          .indexOf(req.params.comment_id);

        if (commentIndex < 0) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Comment does not exist' }] });
        }

        const liked =
          item.comments[commentIndex].likes!.filter(
            like => like.user!.toString() === req.user!.id
          ).length > 0;

        const disliked =
          (await item.comments[commentIndex].dislikes!.filter(
            like => like.user!.toString() === req.user!.id
          ).length) > 0;

        const othersLikes = await item.comments[commentIndex].likes!.filter(
          like => like.user!.toString() !== req.user!.id
        );

        const othersDislikes = await item.comments[commentIndex].likes!.filter(
          like => like.user!.toString() !== req.user!.id
        );

        if (liked) {
          item.comments[commentIndex].likes = [...othersLikes];
        } else if (disliked) {
          item.comments[commentIndex].likes!.unshift({ user: req.user!.id });
          item.comments[commentIndex].dislikes = [...othersDislikes];
        } else {
          item.comments[commentIndex].likes!.unshift({ user: req.user!.id });
        }

        await item.save();

        res.json(item.comments[commentIndex]);
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/items/comment/dislike/:item_id/:comment
// @desc    Add like to item comment
// @acces   Private
router.put(
  '/comment/dislike/:item_id/:comment_id',
  auth,
  async (req: Request, res: Response) => {
    try {
      const item = await Item.findOne({ _id: req.params.item_id });

      if (item === undefined || item === null) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Item does not exist' }] });
      } else {
        const commentIndex = await item.comments
          .map(comment => comment.id)
          .indexOf(req.params.comment_id);

        if (commentIndex < 0) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Comment does not exist' }] });
        }

        const liked =
          (await item.comments[commentIndex].likes!.filter(
            like => like.user!.toString() === req.user!.id
          ).length) > 0;

        const disliked =
          (await item.comments[commentIndex].dislikes!.filter(
            like => like.user!.toString() === req.user!.id
          ).length) > 0;

        const othersLikes = await item.comments[commentIndex].likes!.filter(
          like => like.user!.toString() !== req.user!.id
        );

        const othersDislikes = await item.comments[commentIndex].likes!.filter(
          like => like.user!.toString() !== req.user!.id
        );

        if (disliked) {
          item.comments[commentIndex].dislikes = [...othersDislikes];
        } else if (liked) {
          item.comments[commentIndex].dislikes!.unshift({ user: req.user!.id });
          item.comments[commentIndex].likes = [...othersLikes];
        } else {
          item.comments[commentIndex].dislikes!.unshift({ user: req.user!.id });
        }

        await item.save();

        res.json(item.comments[commentIndex]);
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
