const fetchApi = async (endpoint) => {
	const response = await fetch(`http://localhost:5678/api/${endpoint}`);
	const data = await response.json();
	return data;
}

const displayAndFilterProjects = async ({
	projects = [],
	filter = 'Tous',
}) => {
	const galleryElement = document.querySelector('.gallery');
	galleryElement.innerHTML = '';
	projects
		.filter(({
			category: {
				name: categoryName = '',
			} = {},
		}) => (
			(categoryName === filter)
			|| (filter === 'Tous')
		))
		.forEach(({
			title,
			id,
			imageUrl,
		}) => {
			const figureElement = document.createElement('figure');
			const imgElement = document.createElement('img');
			const figcaptionElement = document.createElement('figcaption');

			imgElement.src = imageUrl;
			imgElement.alt = title;

			figcaptionElement.textContent = title;

			figureElement.appendChild(imgElement);
			figureElement.appendChild(figcaptionElement);

			galleryElement.appendChild(figureElement);
		})
}

const displayCategoriesFilters = async ({
	categories = [],
}) => {
	const filtersContainerElement = document.querySelector('.filters-container');
	categories
		.forEach(({
			name,
			id,
		}) => {
			const buttonElement = document.createElement('button');

			buttonElement.innerHTML = name;
			buttonElement.dataset.info = name;
			buttonElement.classList.add('filter-button')
			if (id === 0) {
				buttonElement.classList.add('filter-button-active')
			}

			filtersContainerElement.appendChild(buttonElement);
		})
}

const removeClassToElements = (elements, classToRemove) => {
	elements.forEach((el) => {
		el.classList.remove(classToRemove);
	})
}

const showCategories = (projects) => {
	const categories = new Set();

	projects.forEach(({
		category: {
			name: categoryName = '',
		} = {},
		...rest
	}) => {
		categories.add(categoryName)
	})

	return categories
}

const initializeAllProjects = async () => {
	const allProjects = await fetchApi('works');

	const projectsCategories = await fetchApi('categories');
	const allCategories = [
		{
			id: 0,
			name: 'Tous',
		},
		...projectsCategories,
	];

	displayAndFilterProjects({
		projects: allProjects,
		filter: 'Tous',
	});

	displayCategoriesFilters({
		categories: allCategories,
	});

	const filterButtons = document.querySelectorAll('.filter-button');

	filterButtons.forEach(function(button) {
	  button.addEventListener('click', function() {
	  	removeClassToElements(filterButtons, 'filter-button-active');
			button.classList.add('filter-button-active');
	    const buttonText = button.dataset.info.trim();
	    displayAndFilterProjects({
	    	projects: allProjects,
	    	filter: buttonText,
	    })
	  });
	});

};


initializeAllProjects();
