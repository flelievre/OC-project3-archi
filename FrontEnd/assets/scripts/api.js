export const fetchApi = async ({
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
