// app.js - Main application functionality

// Constants and configuration
const API_BASE_URL = 'php';  // Base URL for API endpoints

// Utility functions
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Load genres list in sidebar
function loadGenres() {
    const genresList = document.getElementById('genresList');
    if (!genresList) return;
    
    fetch(`${API_BASE_URL}/getGenres.php`, {
        headers: getAuthHeaders()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            genresList.innerHTML = '';
            data.genres.forEach(genre => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="genre.html?id=${genre.id}">${genre.name}</a>`;
                genresList.appendChild(li);
            });
        }
    })
    .catch(error => {
        console.error('Error loading genres:', error);
        // Fallback to static genres if API fails
        const fallbackGenres = ['Fiction', 'Non-Fiction', 'Mystery', 'Sci-Fi', 'Romance', 'Biography', 'History', 'Self-Help'];
        genresList.innerHTML = '';
        fallbackGenres.forEach(genre => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="genre.html?name=${genre}">${genre}</a>`;
            genresList.appendChild(li);
        });
    });
}

// Load user's in-progress books
function loadInProgressBooks() {
    const container = document.getElementById('continueReadingContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading your books...</div>';
    
    fetch(`${API_BASE_URL}/getUserBooks.php?status=in_progress`, {
        headers: getAuthHeaders()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.books.length > 0) {
            renderBooksList(container, data.books);
        } else {
            container.innerHTML = '<p>You don\'t have any books in progress. <a href="explore.html">Start reading!</a></p>';
        }
    })
    .catch(error => {
        console.error('Error loading in-progress books:', error);
        container.innerHTML = '<p>Failed to load your books. Please try again.</p>';
    });
}

// Load trending books
function loadTrendingBooks() {
    const container = document.getElementById('trendingBooksContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading trending books...</div>';
    
    fetch(`${API_BASE_URL}/getBooks.php?trending=1`, {
        headers: getAuthHeaders()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.books.length > 0) {
            renderBooksList(container, data.books);
        } else {
            container.innerHTML = '<p>No trending books found.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading trending books:', error);
        container.innerHTML = '<p>Failed to load trending books. Please try again.</p>';
        
        // Load fallback data from JSON file if API fails
        loadFallbackBooks(container, 'trending');
    });
}

// Load new books
function loadNewBooks() {
    const container = document.getElementById('newBooksContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading new books...</div>';
    
    fetch(`${API_BASE_URL}/getBooks.php?new=1`, {
        headers: getAuthHeaders()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.books.length > 0) {
            renderBooksList(container, data.books);
        } else {
            container.innerHTML = '<p>No new books found.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading new books:', error);
        container.innerHTML = '<p>Failed to load new books. Please try again.</p>';
        
        // Load fallback data from JSON file if API fails
        loadFallbackBooks(container, 'new');
    });
}

// Load recommended books
function loadRecommendedBooks() {
    const container = document.getElementById('recommendedBooksContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading recommendations...</div>';
    
    fetch(`${API_BASE_URL}/getRecommendations.php`, {
        headers: getAuthHeaders()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.books.length > 0) {
            renderBooksList(container, data.books);
        } else {
            container.innerHTML = '<p>No recommendations yet. Start reading and rating books to get personalized suggestions!</p>';
        }
    })
    .catch(error => {
        console.error('Error loading recommendations:', error);
        container.innerHTML = '<p>Failed to load recommendations. Please try again.</p>';
        
        // Load fallback data from JSON file if API fails
        loadFallbackBooks(container, 'recommended');
    });
}

// Load fallback book data from JSON
function loadFallbackBooks(container, type) {
    fetch('data/books.json')
        .then(response => response.json())
        .then(data => {
            let books = [];
            
            switch(type) {
                case 'trending':
                    books = data.trending || [];
                    break;
                case 'new':
                    books = data.new || [];
                    break;
                case 'recommended':
                    books = data.recommended || [];
                    break;
                default:
                    books = data.books || [];
            }
            
            if (books.length > 0) {
                renderBooksList(container, books);
            } else {
                container.innerHTML = '<p>No books available.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading fallback data:', error);
            container.innerHTML = '<p>Could not load books.</p>';
        });
}

// Render books list to container
function renderBooksList(container, books) {
    container.innerHTML = '';
    
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        
        // Calculate progress indicator width
        const progressWidth = book.progress ? `${book.progress}%` : '0%';
        
        bookCard.innerHTML = `
            <a href="book-details.html?id=${book.id}">
                <div class="book-cover">
                    <img src="${book.cover_image_url || 'assets/images/default-cover.jpg'}" alt="${book.title}">
                    <div class="book-progress-indicator" style="width: ${progressWidth}"></div>
                </div>
                <div class="book-info">
                    <h4 class="book-title">${book.title}</h4>
                    <p class="book-author">${book.author}</p>
                    <div class="book-rating">
                        <div class="stars">${generateStarRating(book.average_rating || 0)}</div>
                        <span>${(book.average_rating || 0).toFixed(1)}</span>
                    </div>
                </div>
            </a>
        `;
        
        container.appendChild(bookCard);
    });
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Add half star if needed
    if (halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// Initialize the application
function initApp() {
    // Load sidebar genres
    loadGenres();
    
    // Check if we're on the home page
    if (document.getElementById('continueReadingContainer')) {
        loadInProgressBooks();
        loadTrendingBooks();
        loadNewBooks();
        loadRecommendedBooks();
    }
}

// Event listeners for document load
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});
