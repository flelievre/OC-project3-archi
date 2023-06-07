import {
	fetchApi,
} from './api.js';

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

			buttonElement.innerHTML = (name === 'Hotels & restaurants')
				? 'Hôtels & restaurants'
				: name;
			buttonElement.dataset.info = name;
			buttonElement.classList.add('filter-button')
			if (id === 0) {
				buttonElement.classList.add('filter-button-active')
			}

			filtersContainerElement.appendChild(buttonElement);
		});
};

const removeClassToElements = (elements, classToRemove) => {
	elements.forEach((el) => {
		el.classList.remove(classToRemove);
	})
};

const getAuthUser = () => (
	JSON.parse(localStorage.getItem('authUser') || '{}')
);

const showAdminIfAuthenticated = ({
	allProjects,
}) => {
	const {
		token,
		userId,
	} = getAuthUser();
	if (userId && token) {
		displayAndFilterProjects({
			projects: allProjects,
			filter: 'Tous',
		});
		document.querySelector('.admin-header').classList.remove('display-none');
		
		document.querySelector('.filters-container').classList.add('display-none');

		document.querySelector('header').classList.add('padding-top-50px');

		document.querySelector('#loginLogoutButton').innerHTML = 'logout';
		document.querySelector('#loginLogoutButton').href = '#';

		document.querySelectorAll('.modify-button').forEach((el) => {
			el.classList.remove('display-none');
		});
	}
};

const logOut = () => {
	if (document.querySelector('#loginLogoutButton').innerHTML === 'logout') {
		localStorage.removeItem('authUser');
		window.location.reload();
	}
}

const showModal = () => {
	document.querySelector('.modal-opacity-filter').classList.remove('display-none');
	document.querySelector('.modal').classList.remove('display-none');
};

const closeModal = () => {
	document.querySelector('.modal-opacity-filter').classList.add('display-none');
	document.querySelector('.modal').classList.add('display-none');
};


const initializeAllProjects = async () => {
	const allProjects = await fetchApi({
		endpoint: 'works',
	});

	showAdminIfAuthenticated({ allProjects });

	const projectsCategories = await fetchApi({
		endpoint: 'categories',
	});

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

	const logOutButton = document.querySelector('#loginLogoutButton');
	logOutButton.addEventListener('click', function() {
		logOut();
	});

	const projectsModalButton = document.querySelector('.modify-projects');
	projectsModalButton.addEventListener('click', function() {
		showModal();
	});

	const closeModalButton = document.querySelector('.modal-button-header');
	closeModalButton.addEventListener('click', function() {
		closeModal();
	});
};


initializeAllProjects();
