// book-details.js - Handle book details page functionality

// Get book ID from URL parameters
function getBookIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load book details
function loadBookDetails() {
    const bookId = getBookIdFromUrl();
    if (!bookId) {
        showError('Book ID is missing.');
        return;
    }
    
    const container = document.getElementById('bookDetailsContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading book details...</div>';
    
    fetch(`${API_BASE_URL}/getBookDetails.php?id=${bookId}`, {
        headers: getAuthHeaders()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            renderBookDetails(container, data.book);
            document.title = `BookBuddy - ${data.book.title}`;
        } else {
            showError(data.message || 'Failed to load book details.');
        }
    })
    .catch(error => {
        console.error('Error loading book details:', error);
        showError('An error occurred while loading book details.');
        
        // Load fallback data from JSON file if API fails
        loadFallbackBookDetails(container, bookId);
    });
}

// Load fallback book details from JSON
function loadFallbackBookDetails(container, bookId) {
    fetch('data/books.json')
        .then(response => response.json())
        .then(data => {
            // Find book by ID in the combined books list
            const allBooks = [
                ...(data.trending || []),
                ...(data.new || []),
                ...(data.recommended || []),
                ...(data.books || [])
            ];
            
            const book = allBooks.find(book => book.id.toString() === bookId.toString());
            
            if (book) {
                renderBookDetails(container, book);
                document.title = `BookBuddy - ${book.title}`;
            } else {
                container.innerHTML = '<p>Book not found.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading fallback book details:', error);
            container.innerHTML = '<p>Could not load book details.</p>';
        });
}

// Render book details 
function renderBookDetails(container, book) {
    container.innerHTML = `
        <div class="book-cover-large">
            <img src="${book.cover_image_url || 'assets/images/default-cover.jpg'}" alt="${book.title}">
        </div>
        <div class="book-info-large">
            <h2>${book.title}</h2>
            <p class="book-author">by ${book.author}</p>
            <div class="book-rating">
                <div class="stars">${generateStarRating(book.average_rating || 0)}</div>
                <span>${(book.average_rating || 0).toFixed(1)} (${book.rating_count || 0} ratings)</span>
            </div>
            <div class="book-genres">
                ${renderGenreTags(book.genres)}
            </div>
            <div class="book-description">
                ${book.description || 'No description available.'}
            </div>
            <div class="book-details">
                <div class="book-detail-item">
                    <span class="book-detail-label">Publication Date</span>
                    <span class="book-detail-value">${formatDate(book.publication_date)}</span>
                </div>
                <div class="book-detail-item">
                    <span class="book-detail-label">Pages</span>
                    <span class="book-detail-value">${book.pages || 'N/A'}</span>
                </div>
                <div class="book-detail-item">
                    <span class="book-detail-label">Language</span>
                    <span class="book-detail-value">${book.language || 'English'}</span>
                </div>
                <div class="book-detail-item">
                    <span class="book-detail-label">ISBN</span>
                    <span class="book-detail-value">${book.isbn || 'N/A'}</span>
                </div>
            </div>
            <div class="book-actions">
                <button class="btn btn-primary" id="addToLibraryBtn">
                    ${book.in_library ? 'Already in Library' : 'Add to Library'}
                </button>
                ${book.in_library ? 
                    '<button class="btn btn-secondary" id="markAsReadBtn">Mark as Read</button>' : ''}
            </div>
        </div>
    `;
    
    // Set up event listeners for book action buttons
    const addToLibraryBtn = document.getElementById('addToLibraryBtn');
    if (addToLibraryBtn) {
        addToLibraryBtn.addEventListener('click', function() {
            addBookToLibrary(book.id);
        });
    }
    
    const markAsReadBtn = document.getElementById('markAsReadBtn');
    if (markAsReadBtn) {
        markAsReadBtn.addEventListener('click', function() {
            updateBookProgress(book.id, 100);
        });
    }
}

// Render genre tags
function renderGenreTags(genres) {
    if (!genres || !Array.isArray(genres) || genres.length === 0) {
        return '<span class="genre-tag">General</span>';
    }
    
    return genres.map(genre => 
        `<span class="genre-tag">${genre}</span>`
    ).join('');
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Load reading progress
function loadReadingProgress() {
    const bookId = getBookIdFromUrl();
    if (!bookId) return;
    
    const container = document.getElementById('progressTracker');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading your progress...</div>';
    
    fetch(`${API_BASE_URL}/getUserBookProgress.php?book_id=${bookId}`, {
        headers: getAuthHeaders()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            renderProgressTracker(container, data.progress || 0,
