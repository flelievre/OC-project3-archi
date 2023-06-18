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
		}, index) => {
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
				index,
			});
		})

		initDeleteButtonsListeners();
};

const displayCategoriesOptionsInSelect = (categories = []) => {
	const select = document.getElementById('category-select');
	select.innerHTML = '';

	const optionElement = document.createElement('option');

	optionElement.value = -1;
	optionElement.textContent = '';

	select.appendChild(optionElement);

	categories
		.forEach(({
			id,
			name,
		}) => {
			const optionElement = document.createElement('option');

			optionElement.value = id;
			optionElement.textContent = name;

			select.appendChild(optionElement);
		})
};

const appendToProjectModal = ({
	projectModalFigureElement,
	modalGalleryElement,
	title,
	id,
	index,
}) => {
	const deleteImgElement = document.createElement('img');
	deleteImgElement.src = '/assets/images/bin.svg';
	deleteImgElement.alt = `Delete ${title}`;
	deleteImgElement.id = `project-${id}`;
	deleteImgElement.classList.add('delete-project-button');

	const figcaptionElement = projectModalFigureElement.querySelector('figcaption');
	figcaptionElement.textContent = 'éditer';

	projectModalFigureElement.insertBefore(deleteImgElement, projectModalFigureElement.firstElementChild);

	if (index === 0) {
		const moveImgElement = document.createElement('img');
		moveImgElement.src = '/assets/images/move-white.svg';
		moveImgElement.alt = `Move ${title}`;
		moveImgElement.id = `move-project-${id}`;
		moveImgElement.classList.add('move-project-button');
		projectModalFigureElement.insertBefore(moveImgElement, projectModalFigureElement.firstElementChild);
	}
	

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

const resetAddProjectModalForm = () => {
	const selectElement = document.getElementById('category-select');
  selectElement.selectedIndex = -1;
  selectElement.value = '';

  const imageTitleElement = document.getElementById('image-title');
  imageTitleElement.value = '';

  resetFileInput();
};

const switchModalContent = async ({
	reset = false,
} = {}) => {
	const addProjectModalSection = document.getElementById('modal-add-projects');
	const projectsModalSection = document.getElementById('modal-edit-projects');
	const backModalButtonImg = document.getElementById('modal-back-button-img');
	if (
		!addProjectModalSection.classList.contains('display-none')
		|| reset
	) {
		addProjectModalSection.classList.add('display-none');
		backModalButtonImg.classList.add('display-none');
		projectsModalSection.classList.remove('display-none');

	  resetAddProjectModalForm();
	} else {
		addProjectModalSection.classList.remove('display-none');
		backModalButtonImg.classList.remove('display-none');
		projectsModalSection.classList.add('display-none');
		adaptAddProjectFormIsDiabled();
	}
};

const initDeleteButtonsListeners = () => {
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
}

const showFileInputContent = () => {
	const fileInputIconsContainer = document.querySelector('.file-input-icons-container');
	const fileInputButtonContainer = document.querySelector('.file-input-button-container');
	const fileInputLegend = document.querySelector('.file-input-legend');
  const previewImage = document.getElementById('previewImage');


  fileInputIconsContainer.classList.remove('display-none');
  fileInputButtonContainer.classList.remove('display-none');
  fileInputLegend.classList.remove('display-none');
  previewImage.classList.add('display-none');
}

const hideFileInputContent = () => {
	const fileInputIconsContainer = document.querySelector('.file-input-icons-container');
	const fileInputButtonContainer = document.querySelector('.file-input-button-container');
	const fileInputLegend = document.querySelector('.file-input-legend');
  const previewImage = document.getElementById('previewImage');


  fileInputIconsContainer.classList.add('display-none');
  fileInputButtonContainer.classList.add('display-none');
  fileInputLegend.classList.add('display-none');
  previewImage.classList.remove('display-none');
}

const resetFileInput = () => {
  const fileInput = document.getElementById('pictureInput');
  const previewImage = document.getElementById('previewImage');

  const newFileInput = document.createElement('input');
  newFileInput.type = 'file';
  newFileInput.id = 'pictureInput';
  newFileInput.accept = "image/png,image/jpg";

  fileInput.parentNode.replaceChild(newFileInput, fileInput);

  previewImage.src = '';

  newFileInput.addEventListener('change', (event) => {
	  const file = event.target.files[0];
	  adaptAddProjectFormIsDiabled();

	  if (file) {
	    const reader = new FileReader();

	    reader.onload = (e) => {
	  		adaptAddProjectFormIsDiabled();
	      previewImage.src = e.target.result;
				hideFileInputContent();
	    };

	    reader.readAsDataURL(file);
	  } else {
	    previewImage.src = '';
	  }
	});
	showFileInputContent();
};

const uploadPicture = async () => {
  const input = document.getElementById('pictureInput');
  const file = input.files[0];

  const selectElement = document.getElementById('category-select');
  const category = selectElement?.value;

  const imageTitleElement = document.getElementById('image-title');
  const title = imageTitleElement?.value;

  if (!title || title.length === 0){
  	alert('Titre requis')
  }

  if (!category || Number.isNaN(category) || category < 1){
  	alert('Catégorie requise')
  }

  if (file) {
    // Check file size (maximum 5MB)
    const fileSize = file.size / 1024 / 1024; // in MB
    if (fileSize > 5) {
      alert('File size exceeds the maximum limit of 5MB.');
      return;
    }

    // Check file type (image only)
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('category', category);

		const {
			token,
			userId,
		} = getAuthUser();

    await fetchApi({
    	endpoint: 'works',
      options: {
      	method: 'POST',
      	headers: {
			    'Authorization': `Bearer ${token}`,
			  },
      	body: formData,
      },
    })
      .then(async ({
      	id = -1,
      } = {}) => {
        if (id > -1) {
        	const projects = await resetProjects();
				  displayAndFilterProjects({
						projects,
						filter: 'Tous',
					});
					switchModalContent();
        } else {
        	alert('Une erreur s\'est produite');
        }
      })
      .catch(error => {
        alert('Impossible de joindre le serveur');
        console.error('Impossible de joindre le serveur', error);
      });
  } else {
    alert('Image requise');
  }
}

const adaptAddProjectFormIsDiabled = () => {
	const titleInput = document.getElementById('image-title');
	const categorySelectInput = document.getElementById('category-select');
	const submitProjectButton = document.getElementById('submit-project-button');
	const input = document.getElementById('pictureInput');
  const file = input?.files[0];

  if (
  	!file
  	|| (titleInput.value.trim() === '')
  	|| (categorySelectInput.value < 1)
  ) {
    submitProjectButton.disabled = true;
  } else {
    submitProjectButton.disabled = false;
  }
};

const initCloseModalListeners = async () => {
	const closeModalButton = document.querySelector('.modal-button-header');
	closeModalButton.addEventListener('click', function() {
		closeModal();
	});

	const adminHeader = document.querySelector('.admin-header');
	adminHeader.addEventListener('click', function() {
		closeModal();
	});

	const modalOpacityFilter = document.querySelector('.modal-opacity-filter');
	modalOpacityFilter.addEventListener('click', function() {
		closeModal();
	});
};

const initializeAllProjects = async () => {
	// // FOR DEV PURPOSE
	
	// showModal();
	// switchModalContent();
	
	// //END

	const allProjects = await resetProjects();

	showAdminIfAuthenticated({ allProjects });

	const projectsCategories = await fetchApi({
		endpoint: 'categories',
	});

	displayCategoriesOptionsInSelect(projectsCategories);

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

	initCloseModalListeners();

	const backModalButton = document.querySelector('.back-modal-button-header');
	backModalButton.addEventListener('click', function() {
		switchModalContent();
	});

	const addProjectButton = document.getElementById('add-project-button');

  addProjectButton.addEventListener('click', function() {
  	switchModalContent();
  });

	// Get the input element and the button element
	const titleInput = document.getElementById('image-title');
	const categorySelectInput = document.getElementById('category-select');

	titleInput.addEventListener('input', () => {
	  adaptAddProjectFormIsDiabled();
	});

	categorySelectInput.addEventListener('change', () => {
	  adaptAddProjectFormIsDiabled();
	});

	const submitProjectButton = document.getElementById('submit-project-button');

  submitProjectButton.addEventListener('click', async function() {
  	await uploadPicture();
  });

  resetAddProjectModalForm();
};


initializeAllProjects();
