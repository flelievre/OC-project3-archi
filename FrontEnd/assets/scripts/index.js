import {
	fetchApi,
} from './api.js';

const displayAndFilterProjects = async ({
	projects = [],
	filter = 'Tous',
}) => {
	const galleryElement = document.querySelector('.gallery');
	galleryElement.innerHTML = '';

	const modalGalleryElement = document.querySelector('.modal-gallery');
	modalGalleryElement.innerHTML = '';

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

			const projectModalFigureElement = figureElement.cloneNode(true);

			appendToProjectModal({
				projectModalFigureElement,
				modalGalleryElement,
				title,
				id,
			});
		})
};

const appendToProjectModal = ({
	projectModalFigureElement,
	modalGalleryElement,
	title,
	id,
}) => {
	const deleteImgElement = document.createElement('img');
	deleteImgElement.src = '/assets/images/bin.svg';
	deleteImgElement.alt = `Delete ${title}`;
	deleteImgElement.id = `project-${id}`;
	deleteImgElement.classList.add('delete-project-button');

	const figcaptionElement = projectModalFigureElement.querySelector('figcaption');
	figcaptionElement.textContent = 'éditer';

	projectModalFigureElement.insertBefore(deleteImgElement, projectModalFigureElement.firstElementChild);

	modalGalleryElement.appendChild(projectModalFigureElement);
};

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
	switchModalContent({
		reset: true,
	});
};

const deleteProject = async ({
	projectId = '',
} = {}) => {
	const {
		token,
		userId,
	} = getAuthUser();
	try {
		await fetchApi({
			endpoint: `works/${projectId}`,
			options: {
				method: 'DELETE',
			  headers: {
			    'Content-Type': 'application/json;charset=utf-8',
			    'Authorization': `Bearer ${token}`,
			  },
			},
		});
	} catch (e) {
		console.error(e);
	}
};


const resetProjects = async () => {
	const allProjects = await fetchApi({
		endpoint: 'works',
	});
	return allProjects;
};

const switchModalContent = async ({
	reset = false,
} = {}) => {
	const addProjectModalSection = document.getElementById('modal-add-project');
	const projectsModalSection = document.getElementById('modal');
	const backModalButtonImg = document.getElementById('modal-back-button-img');
	if (
		!addProjectModalSection.classList.contains('display-none')
		|| reset
	) {
		addProjectModalSection.classList.add('display-none');
		backModalButtonImg.classList.add('display-none');
		projectsModalSection.classList.remove('display-none');
	} else {
		addProjectModalSection.classList.remove('display-none');
		backModalButtonImg.classList.remove('display-none');
		projectsModalSection.classList.add('display-none');
	}
};

const initializeAllProjects = async () => {
	const allProjects = await resetProjects();

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

	const backModalButton = document.querySelector('.back-modal-button-header');
	backModalButton.addEventListener('click', function() {
		console.log('click');
		switchModalContent();
	});

	const deleteProjectButtons = document.querySelectorAll('.delete-project-button');

	deleteProjectButtons.forEach(function(deleteProjectButton) {
	  deleteProjectButton.addEventListener('click', async function() {
	  	const splittedProjectId = deleteProjectButton?.id.split('-');
	  	const projectId = (splittedProjectId.length > 0)
	  		? splittedProjectId[1]
	  		: null;
	  	if (projectId) {
	  		await deleteProject({
		  		projectId,
		  	});
		  	const allRemainingProjects = await resetProjects();
			  displayAndFilterProjects({
					projects: allRemainingProjects,
					filter: 'Tous',
				});
	  	}
	  });
	});

	const addProjectButton = document.querySelector('.modal-gallery-add-button');

  addProjectButton.addEventListener('click', async function() {
  	switchModalContent();
  });
};


initializeAllProjects();
