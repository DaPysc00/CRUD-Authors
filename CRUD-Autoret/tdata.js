// Global variables
let table;
let editingId = null;
let modalInstance;
let selectedImageBase64 = "";

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

    initialData.push([
      authorCell, // image + author name
      work,
      books,
      desc,
      actionButtonsHTML(id),
    ]);
  });

  // Initialize DataTable
  table = $("#authorsTable").DataTable({
    data: initialData,
    columns: [
      { title: "Autori" },
      { title: "Vepra e tyre" },
      { title: "Librat" },
      { title: "Përshkrimi" },
      { title: "Veprime" },
    ],
    paging: true,
    lengthChange: false,
    ordering: true,
    info: true,
    responsive: true,
    pageLength: 10,
    order: [[0, "asc"]],
    columnDefs: [{ orderable: false, targets: [4] }],
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
});

// Generate next ID
function getNextAvailableId() {
  const ids = table
    .rows()
    .data()
    .toArray()
    .map((r) => parseInt($(r[0]).text().match(/\d+/)));
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
  const image = selectedImageBase64 || "Images/default.jpg";

  if (editingId !== null) {
    // Update existing
    const rowIndex = table
      .rows()
      .indexes()
      .toArray()
      .find((i) =>
        $(table.row(i).data()[0]).text().includes(`ID: #A00${editingId}`)
      );

    if (rowIndex !== undefined) {
      const books = table.row(rowIndex).data()[2];
      table
        .row(rowIndex)
        .data([
          `<div class="d-flex align-items-center gap-3">
              <img src="${image}" class="author-img">
              <div>
                <strong>${name}</strong><br>
                <small class="text-muted">ID: #A00${editingId}</small>
              </div>
           </div>`,
          work,
          books,
          desc,
          actionButtonsHTML(editingId),
        ])
        .draw(false);
    }
  } else {
    // Add new
    const newId = getNextAvailableId();
    const randomBooks = Math.floor(Math.random() * 10) + 1;

    table
      .row.add([
        `<div class="d-flex align-items-center gap-3">
            <img src="${image}" class="author-img">
            <div>
              <strong>${name}</strong><br>
              <small class="text-muted">ID: #A00${newId}</small>
            </div>
         </div>`,
        work,
        randomBooks,
        desc,
        actionButtonsHTML(newId),
      ])
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
    .find((i) =>
      $(table.row(i).data()[0]).text().includes(`ID: #A00${id}`)
    );

  if (rowIndex === undefined) return;

  const data = table.row(rowIndex).data();
  editingId = id;

  // Extract text values
  const authorName = $(data[0]).find("strong").text();
  const imgSrc = $(data[0]).find("img").attr("src");
  const work = data[1];
  const desc = data[3];

  document.getElementById("authorName").value = authorName;
  document.getElementById("authorWork").value = work;
  document.getElementById("authorDescription").value = desc;

  if (imgSrc) {
    const preview = document.getElementById("previewImage");
    preview.src = imgSrc;
    preview.classList.remove("d-none");
  }

  document.getElementById(
    "addAuthorModalLabel"
  ).innerHTML = '<i class="bi bi-pencil-fill"></i> Ndrysho Autor';
  document.getElementById(
    "submitBtn"
  ).innerHTML = '<i class="bi bi-check-circle-fill"></i> Ruaj Ndryshimet';
  modalInstance.show();
}

// Delete Author
function deleteAuthor(id) {
  if (confirm("A jeni të sigurt që dëshironi të fshini këtë autor?")) {
    const rowIndex = table
      .rows()
      .indexes()
      .toArray()
      .find((i) =>
        $(table.row(i).data()[0]).text().includes(`ID: #A00${id}`)
      );

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
  ).innerHTML = '<i class="bi bi-person-plus-fill"></i> Shto Autor';
  document.getElementById(
    "submitBtn"
  ).innerHTML = '<i class="bi bi-check-circle-fill"></i> Ruaj';
}

// Pagination buttons
function goToPrev() {
  table.page("previous").draw("page");
}
function goToNext() {
  table.page("next").draw("page");
}
