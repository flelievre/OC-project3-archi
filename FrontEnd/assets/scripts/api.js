export fetchApi = async (endpoint) => {
	const response = await fetch(`http://localhost:5678/api/${endpoint}`);
	const data = await response.json();
	return data;
}