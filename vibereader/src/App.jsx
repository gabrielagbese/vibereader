import { useState } from 'react'
import { Document, Page } from 'react-pdf'
import { pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import './App.scss'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function App() {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)

  function onFileChange(event) {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
    setPageNumber(1)
  }

  return (
    <div className="App">
      <div className="sidebar">
        <h1>ViberReader</h1>
        <input type="file" accept=".pdf" onChange={onFileChange} />
        {file && (
          <div className="controls">
            <p>
              Page {pageNumber} of {numPages}
            </p>
            <div className="navigation">
              <button
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber(pageNumber - 1)}
              >
                Previous
              </button>
              <button
                disabled={pageNumber >= numPages}
                onClick={() => setPageNumber(pageNumber + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="main-content">
        {file ? (
          <div className="pdf-container">
            <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={pageNumber} />
            </Document>
          </div>
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
