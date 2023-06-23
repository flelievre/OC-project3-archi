const fetchApi = async ({
	endpoint = '',
	options = {},
} = {}) => {
	const response = await fetch(
		`http://localhost:5678/api/${endpoint}`,
		{
			...options,
		},
	);
	if (response.status !== 204) {
		const data = await response.json();
		return data;
	}
};

const isValidEmail = (email) => (
	/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
);

const login = async ({
	email,
	password,
} = {}) => {
	if (
		isValidEmail(email)
		&& (password.length > 0)
	) {
		try {
			const {
				userId,
				token,
			} = await fetchApi({
				endpoint: 'users/login',
				options: {
					method: 'POST',
				  headers: {
				    'Content-Type': 'application/json;charset=utf-8'
				  },
				  body: JSON.stringify({
				  	email,
				  	password,
				  })
				},
			});
			if (userId && token) {
				localStorage.setItem('authUser', JSON.stringify({ userId, token }));
				window.location.href = 'index.html';
			} else {
				alert('Email ou mot de passe incorrect')
			}
		} catch (e) {
			alert('Serveur injoignable, veuillez rééssayer plus tard...')
		}
	} else {
		alert('Email ou mot de passe incorrect');
	}
};

const onLoginClick = () => {
	const providedEmail = email.value;
	const providedPassword = password.value;

	login({
		email: providedEmail,
		password: providedPassword,
	});
};

const initLogin = () => {
	const form = document.getElementById('loginForm');

	form.addEventListener('submit', function(event) {
	  event.preventDefault();
	  onLoginClick();
	});
};

initLogin();
