// Function to search for plants  
function searchPlant() {  
    const query = document.getElementById('searchInput').value.trim();  
   
    // Prevent empty search submissions   
    if (!query) {    
        alert('Please enter a plant name to search.');    
        return;    
    }

    console.log('Search initiated for:', query);  // Debugging line

    fetch(`http://127.0.0.1:5000/search?query=${encodeURIComponent(query)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok'); 
            } 
            return response.json(); 
        })
        .then(data => {      
            console.log('Response data:', data);  // Debugging line       
            const resultsContainer = document.getElementById('results');    

            // Check if a message is returned (no plant found)
            if (data.message) {  
                resultsContainer.innerHTML = ` 
                    <p>${data.message}</p> 
                    <button onclick="showForm()">Report a missing plant</button>  
                `;  
            } 
            
            // Check if plant data is returned
            else if (data.name) {  
                displayResults(data);  
            } else {
                resultsContainer.innerHTML = `<p>No plant found matching the search criteria.</p>`;
            }

            // Scroll smoothly to the results container  
            resultsContainer.scrollIntoView({ behavior: 'smooth' });  
        })   
        .catch(error => { 
            console.error('Error:', error); 
            alert('An error occurred while searching for the plant. Please try again.'); 
        });  
}

// Function to show the reporting form
function showForm() {  
    console.log('showForm called'); // Debugging line  
    document.getElementById('results').innerHTML = `  
        <div class="form-section" id="userProblemForm"> 
            <form id="missingPlantForm" enctype="multipart/form-data"> 
                <label for="description">What problem are you facing?</label><br> 
                <textarea id="description" name="description" rows="4" required></textarea><br> 
                <label for="email">Email</label><br> 
                <input type="email" id="email" name="email" required><br> 
                <label for="image">Upload a photo</label><br> 
                <input type="file" id="image" name="image" accept="image/*" required><br><br> 
                <button type="button" onclick="submitForm()">Send</button> 
            </form> 
            <div class="error-message" id="errorMessage" style="display:none;"></div> 
        </div>
    `;
}

// Function to submit the form
function submitForm() {
    const form = document.getElementById('missingPlantForm');
    const formData = new FormData(form);

    fetch('http://127.0.0.1:5000/api/submit', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
        // Optionally clear the form after submission
        document.getElementById('userProblemForm').innerHTML = '';
    }) 
    .catch(error => { 
        console.error('Error:', error); 
        alert('An error occurred while submitting the form. Please try again.');
    });
}

// Function to upload an image for identification 
function uploadImage(file = null) { 
    const inputFile = file || document.getElementById('image').files[0]; 

    if (!inputFile) {
        alert('Please select an image file.');
        return;
    }
    
    const formData = new FormData(); 
    formData.append('file', inputFile);  // Changed 'image' to 'file' to match the server-side expectation

    fetch('http://127.0.0.1:5000/predict', {  
        method: 'POST',
        body: formData
    }) 
    .then(response => {  
        if (!response.ok) { 
            throw new Error('Network response was not ok'); 
        } 
        return response.json(); 
    })
    .then(data => {
        // Check if class is returned in the response
        if (data.name) { 
            displayResults(data); 
        } else { 
            showPopup('Sorry, we couldn’t identify the plant. Please try uploading another image or re-upload a clearer one.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showPopup('An error occurred during plant identification. Please try again later.');
    });
}

// Allow drag over for drop area
function allowDrag(event) { 
    event.preventDefault(); 
    document.getElementById('dropArea').classList.add('highlight'); 
}

// Handle file selection
function handleFileSelect(event) {
    const fileInput = event.target;
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        document.getElementById('fileName').textContent = file.name;

        const reader = new FileReader();
        reader.onload = function(e) {
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Handle file drop
function handleDrop(event) {
    event.preventDefault();
    document.getElementById('dropArea').classList.remove('highlight');

    const files = event.dataTransfer.files;
    if (files.length) { 
        const file = files[0]; 
        document.getElementById('image').files = files; // Assign the dropped files to the file input 
        document.getElementById('fileName').textContent = file.name;

        const reader = new FileReader();
        reader.onload = function(e) { 
            const imagePreview = document.getElementById('imagePreview'); 
            imagePreview.src = e.target.result; 
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);

        uploadImage(file);  // Call uploadImage directly after drop
    }
}

// Handle drag leave
function handleDragLeave(event) {
    event.preventDefault();
    document.getElementById('dropArea').classList.remove('highlight');
}
 
// Display results from the plant identification 
function displayResults(data) { 
    const resultsSection = document.getElementById('results'); 

    // Clear previous results
    resultsSection.innerHTML = '';

    // Create result elements
    const title = document.createElement('h2'); 
    title.textContent = 'Results'; 
 
    const plantName = document.createElement('p');
    plantName.textContent = `Plant Name: ${data.name}`;

    const scientificName = document.createElement('p');
    scientificName.textContent = `Scientific Name: ${data.scientific_name}`;

    const image = document.createElement('img');
    image.src = `pics/${data.image_url}`;  // Path to the image in your static folder
    console.log('Image Source:', image.src); // Log the image source for debugging
    image.alt = `${data.name} image`;
    image.style.width = '300px';  // Set a fixed width
    image.style.height = '200px'; // Set a fixed height
    image.style.objectFit = 'cover'; // Maintain aspect ratio while covering the area

    const medicinalBenefitsTitle = document.createElement('h3');
    medicinalBenefitsTitle.textContent = 'Medicinal Benefits:';

    const medicinalBenefits = document.createElement('p');
    medicinalBenefits.textContent = data.medicinal_benefits;

    // Append results to the results section
    resultsSection.appendChild(title); 
    resultsSection.appendChild(plantName); 
    resultsSection.appendChild(scientificName); 
    resultsSection.appendChild(image);
    resultsSection.appendChild(medicinalBenefitsTitle);
    resultsSection.appendChild(medicinalBenefits);

    // Smooth scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' }); 
}
// Show a popup with a message
function showPopup(message) {
    const popup = document.getElementById('popup');
    document.getElementById('popup-text').textContent = message;
    popup.style.display = 'block';
}

// Close the popup
function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

// Event listeners for drag and drop functionality
document.getElementById('dropArea').addEventListener('dragover', allowDrag); 
document.getElementById('dropArea').addEventListener('dragleave', handleDragLeave);  
document.getElementById('dropArea').addEventListener('drop', handleDrop);  
document.getElementById('image').addEventListener('change', handleFileSelect);
