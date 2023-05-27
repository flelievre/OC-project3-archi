const fetchApi = async (endpoint) => {
	const response = await fetch(`http://localhost:5678/api/${endpoint}`);
	const data = await response.json();
	return data;
}

const isValidEmail = (email) => (
	// TO DO
	return true
);

const login = async ({
	email = '',
	password = '',
}) => {
	if (isValidEmail(email)) {
		try {
			console.log('login')
		} catch (e) {
			console.error('backend-error')
		}
	} else {
		console.error('invalid-email-error')
	}
}
