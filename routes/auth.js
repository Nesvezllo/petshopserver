const router = require('express').Router();
const { User } = require('../models/user');
const Token = require('../models/token');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcrypt');
const Joi = require('joi');

router.post('/', async (req, res) => {
	try {
		const { error } = validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });

		const user = await User.findOne({ email: req.body.email });
		if (!user)
			return res
				.status(401)
				.send({ message: 'Неверный email или пароль' });

		const validPassword = await bcrypt.compare(
			req.body.password,
			user.password,
		);

		if (!validPassword)
			return res
				.status(401)
				.send({ message: 'Неверный email или пароль' });

		if (!user.verified) {
			let token = await Token.findOne({ userId: user._id });
			if (!token) {
				token = await new Token({
					userId: user._id,
					token: crypto.randomBytes(32).toString('hex'),
				}).save();
				const url = `http://localhost:8080/users/${user.id}/verify/${token.token}`;
				await sendEmail(user.email, 'Verify Email', url);
			}

			return res.status(400).send({
				message: 'Подтвердите свой аккаунт',
			});
		}

		const token = user.generateAuthToken();
		console.log(token);
		res.status(200).send({
			data: token,
			user: user,
			message: 'logged in successfully',
		});
	} catch (error) {
		res.status(500).send({ message: 'Internal Server Error' });
	}
});
router.get('/jwt/verify', async (req, res) => {
	try {
		const user = await jwt.verify(
			req.query.token,
			"123",
		);
		const userData = await User.findOne({ _id: user._id});
		res.send({
			success: true,
			data: user,
			userData,
			message: 'Valid User',
		});
	} catch (error) {
		res.status(500).send({
			success: false,
			message: error?.message,
		});
	}
});

const validate = (data) => {
	const schema = Joi.object({
		email: Joi.string().email().required().label('Email'),
		password: Joi.string().required().label('Password'),
	});
	return schema.validate(data);
};

module.exports = router;
