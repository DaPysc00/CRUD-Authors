// Global variables
let table;
let editingId = null;
let modalInstance;
let selectedImageBase64 = "";
const defaultImagePath = "Images/people.png";

// Expose functions globally
window.editAuthor = editAuthor;
window.deleteAuthor = deleteAuthor;
window.goToPrev = goToPrev;
window.goToNext = goToNext;
window.resetForm = resetForm;
window.saveAuthor = saveAuthor;

// Helper to create action buttons HTML
function actionButtonsHTML(id) {
  return `
    <button class="btn btn-warning btn-sm me-1" title="Ndrysho" onclick="editAuthor(${id})">
      <i class="bi bi-pencil-fill"></i>
    </button>
    <button class="btn btn-danger btn-sm" title="Fshi" onclick="deleteAuthor(${id})">
      <i class="bi bi-trash-fill"></i>
    </button>
  `;
}

$(document).ready(function () {
  // Extract initial table rows
  const initialData = [];
  $("#authorsTable tbody tr").each(function (index) {
    const cells = $(this).find("td");
    const authorCell = $(cells[0]).html().trim();
    const work = $(cells[1]).text().trim();
    const books = $(cells[2]).text().trim();
    const desc = $(cells[3]).text().trim();
    const id = index + 1;

    initialData.push({
      author: authorCell,
      work: work,
      books: books,
      desc: desc,
      id: id,
      actions: actionButtonsHTML(id)
    });
  });

  // Initialize DataTable
  table = $("#authorsTable").DataTable({
    data: initialData,
    columns: [
      { 
        title: "Autori",
        data: "author",
        render: function(data, type, row) {
          if (type === 'sort' || type === 'filter') {
            const tempDiv = $('<div>').html(data);
            return tempDiv.text();
          }
          return data;
        }
      },
      { 
        title: "Vepra e tyre",
        data: "work"
      },
      { 
        title: "Librat",
        data: "books",
        render: function(data, type, row) {
          if (type === 'sort') {
            return parseInt(data) || 0;
          }
          return data;
        }
      },
      { 
        title: "Përshkrimi",
        data: "desc"
      },
      { 
        title: "Veprime",
        data: "actions"
      },
    ],
    paging: true,
    lengthChange: false,
    ordering: true,
    info: false,
    responsive: true,
    pageLength: 5,
    order: [[0, "asc"]],
    columnDefs: [
      { orderable: false, targets: [4] }
    ],
    search: {
      smart: true,
      regex: false,
      caseInsensitive: true
    }
  });

  // Modal setup
  const modalElement = document.getElementById("addAuthorModal");
  if (modalElement) modalInstance = new bootstrap.Modal(modalElement);

  // Preview image before save
  document
    .getElementById("authorImage")
    .addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          selectedImageBase64 = e.target.result;
          const preview = document.getElementById("previewImage");
          preview.src = selectedImageBase64;
          preview.classList.remove("d-none");
        };
        reader.readAsDataURL(file);
      }
    });

  // Handle entries per page change
  $("#entriesSelect").on("change", function () {
    const value = parseInt($(this).val());
    table.page.len(value).draw();
  });

  // Handle sorting change
  $("#sortSelect").on("change", function () {
    const value = $(this).val();
    const [column, direction] = value.split("-");
    
    if (column === "id") {
      // Sort by ID - extract numeric part from ID field
      const currentData = table.rows().data().toArray();
      currentData.sort((a, b) => {
        // Extract numeric ID from the author HTML (e.g., "#A001" -> 1)
        const getNumericId = (rowData) => {
          const match = rowData.author.match(/#A0*(\d+)/);
          return match ? parseInt(match[1]) : rowData.id;
        };
        
        const idA = getNumericId(a);
        const idB = getNumericId(b);
        
        if (direction === 'asc') {
          return idA - idB;
        } else {
          return idB - idA;
        }
      });
      
      table.clear();
      table.rows.add(currentData);
      table.draw(false);
    } else {
      // Sort by regular column
      const columnIndex = parseInt(column);
      table.order([[columnIndex, direction]]).draw();
    }
  });

  // Update pagination on table draw
  table.on("draw", function () {
    updatePaginationButtons();
    updateInfoDisplay();
    updatePageInfo();
  });

  // Initial update
  updatePaginationButtons();
  updateInfoDisplay();
  updatePageInfo();

  // Search functionality
  $("#searchInput").on("keyup", function () {
    const searchValue = this.value;
    table.search(searchValue).draw();
    
    // Update info display after search
    updateInfoDisplay();
    updatePageInfo();
  });
});

// Update info display
function updateInfoDisplay() {
  const info = table.page.info();
  const start = info.recordsDisplay > 0 ? info.start + 1 : 0;
  const end = info.end;
  const total = info.recordsTotal;
  const filtered = info.recordsDisplay;
  
  if (filtered < total) {
    // Show filtered results message
    document.getElementById("infoDisplay").innerText = `Duke treguar ${start} nga ${end} te ${filtered} (filtruar nga ${total} total)`;
  } else {
    // Show normal message
    document.getElementById("infoDisplay").innerText = `Duke treguar ${start} nga ${end} te ${total} Autoreve`;
  }
}

// Update page info
function updatePageInfo() {
  const info = table.page.info();
  const currentPage = info.page + 1;
  const totalPages = info.pages || 1;
  document.getElementById("pageInfo").innerText = `Faqja ${currentPage} nga ${totalPages}`;
}

// Generate next ID
function getNextAvailableId() {
  const ids = table
    .rows()
    .data()
    .toArray()
    .map((r) => r.id);
  let next = 1;
  while (ids.includes(next)) next++;
  return next;
}

// Save Author
function saveAuthor() {
  const form = document.getElementById("authorForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const name = document.getElementById("authorName").value.trim();
  const work = document.getElementById("authorWork").value.trim();
  const desc = document.getElementById("authorDescription").value.trim();
  const image = selectedImageBase64 || defaultImagePath;

  if (editingId !== null) {
    // Update existing
    const rowIndex = table
      .rows()
      .indexes()
      .toArray()
      .find((i) => table.row(i).data().id === editingId);

    if (rowIndex !== undefined) {
      const currentData = table.row(rowIndex).data();
      table
        .row(rowIndex)
        .data({
          author: `<div class="d-flex align-items-center gap-3">
              <img src="${image}" class="author-img" onerror="this.src='${defaultImagePath}'">
              <div>
                <strong>${name}</strong><br>
                <small class="text-muted">ID: #A00${editingId}</small>
              </div>
           </div>`,
          work: work,
          books: currentData.books,
          desc: desc,
          id: editingId,
          actions: actionButtonsHTML(editingId)
        })
        .draw(false);
    }
  } else {
    // Add new
    const newId = getNextAvailableId();
    const randomBooks = Math.floor(Math.random() * 10) + 1;

    table
      .row.add({
        author: `<div class="d-flex align-items-center gap-3">
            <img src="${image}" class="author-img" onerror="this.src='${defaultImagePath}'">
            <div>
              <strong>${name}</strong><br>
              <small class="text-muted">ID: #A00${newId}</small>
            </div>
         </div>`,
        work: work,
        books: randomBooks,
        desc: desc,
        id: newId,
        actions: actionButtonsHTML(newId)
      })
      .draw(false);
  }

  modalInstance.hide();
  form.reset();
  document.getElementById("previewImage").classList.add("d-none");
  selectedImageBase64 = "";
  editingId = null;
}

// Edit Author
function editAuthor(id) {
  const rowIndex = table
    .rows()
    .indexes()
    .toArray()
    .find((i) => table.row(i).data().id === id);

  if (rowIndex === undefined) return;

  const data = table.row(rowIndex).data();
  editingId = id;

  // Extract text values
  const authorName = $(data.author).find("strong").text();
  const imgSrc = $(data.author).find("img").attr("src");
  const work = data.work;
  const desc = data.desc;

  document.getElementById("authorName").value = authorName;
  document.getElementById("authorWork").value = work;
  document.getElementById("authorDescription").value = desc;

  if (imgSrc) {
    const preview = document.getElementById("previewImage");
    preview.src = imgSrc;
    preview.classList.remove("d-none");
    selectedImageBase64 = imgSrc;
  }

  document.getElementById(
    "addAuthorModalLabel"
  ).innerHTML = '<i class="bi bi-pencil-square"></i> Ndrysho Autor';
  document.getElementById(
    "submitBtn"
  ).innerHTML = '<i class="bi bi-save-fill"></i> Ruaj Ndryshimet';
  modalInstance.show();
}

// Delete Author
function deleteAuthor(id) {
  if (confirm("A jeni të sigurt që dëshironi të fshini këtë autor?")) {
    const rowIndex = table
      .rows()
      .indexes()
      .toArray()
      .find((i) => table.row(i).data().id === id);

    if (rowIndex !== undefined) table.row(rowIndex).remove().draw(false);
  }
}

// Reset Modal
function resetForm() {
  document.getElementById("authorForm").reset();
  document.getElementById("previewImage").classList.add("d-none");
  selectedImageBase64 = "";
  editingId = null;
  document.getElementById(
    "addAuthorModalLabel"
  ).innerHTML = '<i class="bi bi-person-plus-fill"></i> Shto Autor të Ri';
  document.getElementById(
    "submitBtn"
  ).innerHTML = '<i class="bi bi-check-circle-fill"></i> Ruaj Ndryshimet';
}

// Pagination buttons
function goToPrev() {
  table.page("previous").draw("page");
}

function goToNext() {
  table.page("next").draw("page");
}

function updatePaginationButtons() {
  const info = table.page.info();
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (!prevBtn || !nextBtn) return;

  // Disable Previous button if on first page
  prevBtn.disabled = info.page === 0;

  // Disable Next button if on last page or only one page
  nextBtn.disabled = info.page >= info.pages - 1 || info.pages <= 1;
}
