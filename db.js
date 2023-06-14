const mongoose = require('mongoose');
const uri = "mongodb+srv://admin:098zxcasdqwe@kursuchdb.e4etukc.mongodb.net/?retryWrites=true&w=majority"
console.log(uri);
module.exports = () => {
	const connectionParams = {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	};
	try {
		mongoose.connect(uri, connectionParams);
		console.log('connected to database successfully');
	} catch (error) {
		console.log('could not connect to DB');
		console.log(error);
	}
};
