export const fetchApi = async ({
	endpoint = '',
	options = {},
} = {}) => {
	console.log(endpoint);
	const response = await fetch(
		`http://localhost:5678/api/${endpoint}`,
		{
			...options,
		},
	);
	const data = await response.json();
	return data;
};
