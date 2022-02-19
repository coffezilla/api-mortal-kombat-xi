const express = require('express');
const router = express.Router();
const Characters = require('../models/Characters');
const stringify = require('../helper/utils');

// GET SKINS
router.get('/:charId/fatalities', async (req, res) => {
	const { charId } = req.params;
	try {
		const fatalities = await Characters.find(
			{ _id: charId },
			{ fatalities: 1 }
		);
		res.json(fatalities);
	} catch (err) {
		res.json(err);
	}
});

// GET SKINS SPECIFY
router.get('/:charId/fatalities/:fatSlug', async (req, res) => {
	const { charId, fatSlug } = req.params;
	try {
		const fatalities = await Characters.find(
			{ _id: charId },
			{
				fatalities: {
					$elemMatch: { slug: fatSlug },
				},
			}
		);
		res.json(fatalities);
	} catch (err) {
		res.json(err);
	}
});

// POST SKINS
router.post('/:charId/fatalities', async (req, res) => {
	// !!!
	// THIS DATA SHOULD BE RETRIEVED FROM THE SERVER
	const BACKEND_USER = {
		email: process.env.USER_EMAIL,
		authorization: `Bearer ${process.env.AUTH}`,
	};
	// !!!

	const { authorization } = req.headers;
	const response = {
		status: 0,
		message: '',
	};

	//
	if (!authorization) {
		return res.status(403).json({ error: 'No credentials sent!' });
	}

	if (BACKEND_USER.authorization === authorization) {
		const { charId } = req.params;
		const { name, commands } = req.body;

		if (!name || !commands) {
			res.json('Missing data');
		} else {
			try {
				// slugify
				const slug = stringify(name);
				const characters = await Characters.updateOne(
					{ _id: charId },
					{
						$push: {
							fatalities: {
								name: name,
								slug: slug,
								commands: commands,
							},
						},
					}
				);

				res.json({
					...response,
					status: 1,
					message: 'Done',
				});
			} catch (err) {
				res.json({
					...response,
					message: 'Error',
				});
			}
		}
	} else {
		res.json({
			...response,
			message: 'Not authenticated',
		});
	}
});

// DELETE SKIN
router.delete('/:charId/fatalities/:fatSlug', async (req, res) => {
	// !!!
	// THIS DATA SHOULD BE RETRIEVED FROM THE SERVER
	const BACKEND_USER = {
		email: process.env.USER_EMAIL,
		authorization: `Bearer ${process.env.AUTH}`,
	};
	// !!!

	const { authorization } = req.headers;

	//
	if (!authorization) {
		return res.status(403).json({ error: 'No credentials sent!' });
	}

	if (BACKEND_USER.authorization === authorization) {
		const { charId, fatSlug } = req.params;
		try {
			const fatalities = await Characters.updateOne(
				{
					_id: charId,
				},
				{
					$pull: {
						fatalities: {
							slug: fatSlug,
						},
					},
				}
			);
			res.json(fatalities);
		} catch (err) {
			res.json(err);
		}
	} else {
		res.json('not authenticated');
	}
});

// PATCH SKIN
router.patch('/:charId/fatalities/:fatSlug', async (req, res) => {
	// !!!
	// THIS DATA SHOULD BE RETRIEVED FROM THE SERVER
	const BACKEND_USER = {
		email: process.env.USER_EMAIL,
		authorization: `Bearer ${process.env.AUTH}`,
	};
	// !!!

	const { authorization } = req.headers;

	//
	if (!authorization) {
		return res.status(403).json({ error: 'No credentials sent!' });
	}

	if (BACKEND_USER.authorization === authorization) {
		const { charId, fatSlug } = req.params;
		const { name, commands } = req.body;

		if (!name || !commands) {
			res.json('Missing data');
		} else {
			try {
				const slug = stringify(name);
				const fatalities = await Characters.updateOne(
					{
						_id: charId,
						'fatalities.slug': fatSlug,
					},
					{
						$set: {
							'fatalities.$.name': name,
							'fatalities.$.slug': slug,
							'fatalities.$.commands': commands,
						},
					}
				);
				res.json(fatalities);
			} catch (err) {
				res.json(err);
			}
		}
	} else {
		res.json('not authenticated');
	}
});

module.exports = router;
