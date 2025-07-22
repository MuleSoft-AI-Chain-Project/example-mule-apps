const textInput = document.getElementById('textInput');
const imageInput = document.getElementById('imageInput');
const searchButton = document.getElementById('searchButton');
const clearImageButton = document.getElementById('clearImageButton');
const resultsDiv = document.getElementById('results');
const spinner = document.getElementById('spinner');
const storeNameInput = document.getElementById('storeName'); // Store Name input field
const minScoreInput = document.getElementById('minScore');   // Minimum Score input field

// Function to build and display results
function buildResults(data) {
    // Hide the spinner
    spinner.classList.add('d-none');
    
    // Display search results
    console.log('Search results:', data);
    
    resultsDiv.innerHTML = '';

    if (!data.sources || data.sources.length === 0) {
        resultsDiv.innerHTML = '<p class="text-muted text-center">No results found.</p>';
        return;
    }

    const resultsContainer = document.createElement('div');
    resultsContainer.classList.add('row', 'g-3'); // Bootstrap row with spacing

    data.sources.forEach(source => {
        if (source.metadata.source) {
            const image = document.createElement('img');
            image.src = source.metadata.source.replace('s3://s3-bucket-1736703787/', 'https://d2242xguwif5f9.cloudfront.net/'); // Keep this line
            image.alt = source.text || 'Result Image';
            image.classList.add('img-fluid', 'rounded', 'shadow-sm'); // Bootstrap styles
            
            // Format the score to 2 decimal places
            const score = source.score.toFixed(4);
       
            const text = document.createElement('p');
            text.textContent = "Text: " + source.text;
            text.classList.add('text-center', 'mt-2', 'mb-0', 'small'); // Centered & small text
            
            const scoreText = document.createElement('p');
            scoreText.textContent = "Score: " + score;
            scoreText.classList.add('text-center', 'small'); // Centered & small text

            const imageCell = document.createElement('div');
            imageCell.classList.add('col-md-4', 'text-center', 'image-container');
            imageCell.appendChild(image);
            imageCell.appendChild(text);
            imageCell.appendChild(scoreText); // Append the score on a new line
            
            resultsContainer.appendChild(imageCell);
        }
    });

    resultsDiv.appendChild(resultsContainer);
}

document.addEventListener('DOMContentLoaded', () => {
    // Function to set a cookie
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + JSON.stringify(value) + ";" + expires + ";path=/";
    }

    // Function to get a cookie
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return JSON.parse(c.substring(nameEQ.length, c.length));
        }
        return null;
    }

    // Function to populate the search history dropdown
    function populateSearchHistory() {
        const searchHistory = getCookie('searches') || [];
        const datalist = document.getElementById('searchHistory');
        if (datalist) {
            datalist.innerHTML = ''; // Clear existing options

            // Get the last 10 searches
            const last10Searches = searchHistory.slice(-10).reverse();

            last10Searches.forEach(search => {
                const option = document.createElement('option');
                option.value = search.text;
                datalist.appendChild(option);
            });
        }
    }

    // Call the function to populate the search history dropdown on page load
    populateSearchHistory();

    const textSearchOption = document.getElementById('textSearchOption');
    const imageSearchOption = document.getElementById('imageSearchOption');
    const textInput = document.getElementById('textInput');
    const imageInput = document.getElementById('imageInput');

    textSearchOption.addEventListener('change', () => {
        if (textSearchOption.checked) {
            textInput.disabled = false;
            imageInput.disabled = true;
        }
    });

    imageSearchOption.addEventListener('change', () => {
        if (imageSearchOption.checked) {
            textInput.disabled = true;
            imageInput.disabled = false;
        }
    });

    searchButton.addEventListener('click', () => {
        const text = textInput.value.trim(); // Trim to avoid empty spaces
        const imageFile = imageInput.files[0]; // Get the uploaded image file    
        const storeName = storeNameInput.value.trim() || 'image_store'; // Default to 'image_store' if empty
        const minScore = parseFloat(minScoreInput.value) || 0.5; // Default to 0.5 if empty

        // Show the spinner
        spinner.classList.remove('d-none');
        
        // Clear previous results
        resultsDiv.innerHTML = '';

        // Get previous searches from cookies
        let searches = getCookie('searches') || [];

        // Add new search to the array
        const newSearch = { text, storeName, minScore, timestamp: new Date().toISOString() };
        searches.push(newSearch);

        // Keep only the last 50 searches
        if (searches.length > 50) {
            searches = searches.slice(-50);
        }

        // Store updated searches in cookies
        setCookie('searches', searches, 7); // Store for 7 days

        // Populate the search history dropdown with the updated searches
        populateSearchHistory();

        // Scenario 1: Only Text
        if (text) {
            const payload = {
                question: text,
                storeName: storeName,
                minScore: minScore
            };

            console.log('Sending text payload:', payload);

//            fetch('http://localhost:8081/query-store-by-text', {
            fetch('https://ms-vectors-multimodal-app-ch2-fjrr5q.5sc6y6-1.usa-e2.cloudhub.io/query-store-by-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(buildResults) // Call the function to handle the results
            .catch(error => {
                // Hide the spinner
                spinner.classList.add('d-none');

                console.error('Error searching by text:', error);
                resultsDiv.innerHTML = `
                    <div class="alert alert-danger text-center" role="alert">
                        Error searching by text. Please try again.
                    </div>`;
            });
        }
        // Scenario 2: Text + Image
        else if (imageFile) {
            // Create the form data for image search
            const formData = new FormData();
            formData.append('question', "n/a");
            formData.append('storeName', storeName);
            formData.append('minScore', minScore);
            formData.append('image', imageFile); // Add image file with the key 'image'

            console.log('Sending image payload:', formData);

//            fetch('http://localhost:8081/query-store-by-image', {
            fetch('https://ms-vectors-multimodal-app-ch2-fjrr5q.5sc6y6-1.usa-e2.cloudhub.io/query-store-by-image', {
                method: 'POST',
                body: formData // Send the form data with image and text
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(buildResults) // Call the function to handle the results
            .catch(error => {
                // Hide the spinner
                spinner.classList.add('d-none');

                console.error('Error searching by image:', error);
                resultsDiv.innerHTML = `
                    <div class="alert alert-danger text-center" role="alert">
                        Error searching by image. Please try again.
                    </div>`;
            });
        }
    });
});

clearImageButton.addEventListener('click', () => {
    textInput.value = ''; // Clear the text input
    imageInput.value = ''; // Reset the file input
});
