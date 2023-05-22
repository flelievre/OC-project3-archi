const fetchProject = async () => {
	const response = await fetch('http://localhost:5678/api/works');
	const projects = await response.json();
	return projects;
}

const showProjects = async ({
	projects = [],
	projectsCategoryName = 'Tous',
}) => {
	const galleryElement = document.querySelector('.gallery');
	galleryElement.innerHTML = '';
	projects
		.filter(({
			category: {
				name: categoryName = '',
			} = {},
		}) => (
			(categoryName === projectsCategoryName)
			|| (projectsCategoryName === 'Tous')
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

const removeClassToElements = (elements, classToRemove) => {
	elements.forEach((el) => {
		el.classList.remove(classToRemove);
	})
}

const initializeAllProjects = async () => {
	const allProjects = await fetchProject();
	showProjects({
		projects: allProjects,
	});

	const filterButtons = document.querySelectorAll('.filter-button');

	filterButtons.forEach(function(button) {
	  button.addEventListener('click', function() {
	  	removeClassToElements(filterButtons, 'filter-button-active');
			button.classList.add('filter-button-active');
	    const buttonText = button.dataset.info.trim();
	    showProjects({
	    	projects: allProjects,
	    	projectsCategoryName: buttonText,
	    })
	  });
	});
};


initializeAllProjects();
