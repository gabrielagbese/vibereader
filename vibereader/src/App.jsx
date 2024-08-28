import { useState, useCallback, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { FaMoon, FaSun, FaSearch, FaBookmark } from 'react-icons/fa'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import './App.scss'

// PDF.js worker configuration
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const STORAGE_KEY = 'vibeReaderState'

function App() {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1)
  const [darkMode, setDarkMode] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [bookmarks, setBookmarks] = useState([])
  const [error, setError] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [currentSearchResult, setCurrentSearchResult] = useState(-1)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pdfDocumentRef = useRef(null)

  useEffect(() => {
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    setPageNumber(savedState.pageNumber || 1)
    setScale(savedState.scale || 1)
    setDarkMode(savedState.darkMode || false)
    setBookmarks(savedState.bookmarks || [])
    setIsSidebarOpen(savedState.isSidebarOpen !== undefined ? savedState.isSidebarOpen : true)
  }, [])

  useEffect(() => {
    const stateToSave = {
      pageNumber,
      scale,
      darkMode,
      bookmarks,
      isSidebarOpen
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
  }, [pageNumber, scale, darkMode, bookmarks, isSidebarOpen])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // Adjust this breakpoint as needed
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call it initially

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setSearchResults([])
      setCurrentSearchResult(-1)
    }
  }

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages)
  }, [])

  const onDocumentLoadError = (error) => {
    console.error('Error while loading document:', error)
    setError('Failed to load PDF. Please try again with a different file.')
  }

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset)
  }

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode)
  }

  const handleSearch = async () => {
    if (!pdfDocumentRef.current || !searchText) return

    const results = []
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocumentRef.current.getPage(i)
      const textContent = await page.getTextContent()
      const text = textContent.items.map(item => item.str).join(' ')

      if (text.toLowerCase().includes(searchText.toLowerCase())) {
        results.push(i)
      }
    }

    setSearchResults(results)
    setCurrentSearchResult(results.length > 0 ? 0 : -1)
    if (results.length > 0) {
      setPageNumber(results[0])
    }
  }

  const navigateSearchResults = (direction) => {
    if (searchResults.length === 0) return

    let newIndex = currentSearchResult + direction
    if (newIndex < 0) newIndex = searchResults.length - 1
    if (newIndex >= searchResults.length) newIndex = 0

    setCurrentSearchResult(newIndex)
    setPageNumber(searchResults[newIndex])
  }

  const toggleBookmark = () => {
    setBookmarks(prevBookmarks =>
      prevBookmarks.includes(pageNumber)
        ? prevBookmarks.filter(bookmark => bookmark !== pageNumber)
        : [...prevBookmarks, pageNumber]
    )
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState)
  }

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''} ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isSidebarOpen ? '←' : '→'}
      </button>
      <div className="sidebar">
        <h1>ViberReader</h1>
        <input type="file" accept=".pdf" onChange={onFileChange} />
        {file && !error && (
          <>
            <div className="zoom-controls">
              <button onClick={() => setScale(prevScale => prevScale - 0.1)}>Zoom Out</button>
              <span>{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(prevScale => prevScale + 0.1)}>Zoom In</button>
            </div>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search PDF"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <button onClick={handleSearch}><FaSearch /></button>
            </div>
            {searchResults.length > 0 && (
              <div className="search-navigation">
                <button onClick={() => navigateSearchResults(-1)}>Previous Result</button>
                <button onClick={() => navigateSearchResults(1)}>Next Result</button>
                <p>Result {currentSearchResult + 1} of {searchResults.length}</p>
              </div>
            )}
            <button onClick={toggleBookmark}>
              {bookmarks.includes(pageNumber) ? 'Remove Bookmark' : 'Add Bookmark'}
              <FaBookmark />
            </button>
            {bookmarks.length > 0 && (
              <div className="bookmarks">
                <h3>Bookmarks</h3>
                <ul>
                  {bookmarks.map(bookmark => (
                    <li key={bookmark}>
                      <button onClick={() => setPageNumber(bookmark)}>Page {bookmark}</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
        <button onClick={toggleDarkMode} className="dark-mode-toggle">
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
      <div className="main-content">
        {error ? (
          <div className="error">{error}</div>
        ) : file ? (
          <>
            <div className="pdf-container">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                inputRef={pdfDocumentRef}
              >
                <Page pageNumber={pageNumber} scale={scale} />
              </Document>
            </div>
            <div className="controls">
              <p>Page {pageNumber} of {numPages}</p>
              <div className="navigation">
                <button disabled={pageNumber <= 1} onClick={() => changePage(-1)}>Previous</button>
                <button disabled={pageNumber >= numPages} onClick={() => changePage(1)}>Next</button>
              </div>
            </div>
          </>
        ) : (
          <div className="placeholder">
            <p>Select a PDF to view</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App