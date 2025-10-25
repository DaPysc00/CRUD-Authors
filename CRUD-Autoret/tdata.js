// Global variables
let table;
let editingId = null;
let modalInstance;

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
        <button class="btn btn-warning btn-sm me-1" title="Nrysho" onclick="editAuthor(${id})">
            <i class="bi bi-pencil-fill"></i>
        </button>
        <button class="btn btn-danger btn-sm" title="Fshi" onclick="deleteAuthor(${id})">
            <i class="bi bi-trash-fill"></i>
        </button>
    `;
}

// Initialize DataTable properly
$(document).ready(function () {
    // Extract any existing HTML rows to feed DataTables
    const initialData = [];
    $('#authorsTable tbody tr').each(function () {
        const cells = $(this).find('td');
        const id = parseInt($(cells[0]).text().trim());
        const name = $(cells[1]).text().trim();
        const works = $(cells[2]).text().trim();
        const books = $(cells[3]).text().trim();
        const description = $(cells[4]).text().trim();
        initialData.push([id, name, works, books, description, actionButtonsHTML(id)]);
    });

    // Initialize DataTable using data array (so IDs stay synced)
    table = $('#authorsTable').DataTable({
        data: initialData,
        columns: [
            { title: 'ID' },
            { title: 'Emri' },
            { title: 'Vepra' },
            { title: 'Librat' },
            { title: 'Përshkrimi' },
            { title: 'Veprime' },
        ],
        paging: true,
        lengthChange: false,
        ordering: true,
        info: true,
        responsive: true,
        pageLength: 10,
        order: [[0, 'asc']],
        language: {
            search: '',
            lengthMenu: '',
            info: '',
            infoEmpty: '',
            emptyTable: 'Nuk ka të dhëna të disponueshme në tabelë',
        },
        columnDefs: [{ orderable: false, targets: 5 }],
    });

    // Bootstrap Modal setup
    const modalElement = document.getElementById('addAuthorModal');
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement);
    }

    setupPaginationControls();
    updatePaginationInfo();
});

// Pagination Controls
function setupPaginationControls() {
    document.getElementById('entriesSelect').addEventListener('change', function () {
        table.page.len(parseInt(this.value)).draw();
        updatePaginationInfo();
    });

    document.getElementById('searchInput').addEventListener('keyup', function () {
        table.search(this.value).draw();
        updatePaginationInfo();
    });

    table.on('draw', function () {
        updatePaginationInfo();
    });
}

// Update pagination info
function updatePaginationInfo() {
    const info = table.page.info();
    const currentPage = info.page + 1;
    const totalPages = info.pages || 1;

    document.getElementById('pageInfo').textContent = `Faqja ${currentPage} nga ${totalPages}`;
    document.getElementById('infoDisplay').textContent = `Duke treguar ${info.start + 1} deri në ${info.end} nga ${info.recordsTotal} autorë`;

    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

function goToPrev() {
    table.page('previous').draw('page');
}
function goToNext() {
    table.page('next').draw('page');
}

// Reset form
function resetForm() {
    document.getElementById('authorForm').reset();
    document.getElementById('addAuthorModalLabel').innerHTML = '<i class="bi bi-person-plus-fill"></i> Shto Autor';
    document.getElementById('submitBtn').innerHTML = '<i class="bi bi-check-circle-fill"></i> Shto';
    editingId = null;
}

// Find next available numeric ID
function getNextAvailableId() {
    const ids = table
        .rows()
        .data()
        .toArray()
        .map((row) => parseInt(row[0]));
    let nextId = 1;
    while (ids.includes(nextId)) {
        nextId++;
    }
    return nextId;
}

// Save Author (add or edit)
function saveAuthor() {
    const form = document.getElementById('authorForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const name = document.getElementById('authorName').value;
    const works = document.getElementById('authorWork').value;
    const description = document.getElementById('authorDescription').value;

    if (editingId !== null) {
        // Update existing
        const rowIndex = table
            .rows()
            .indexes()
            .toArray()
            .find((i) => table.row(i).data()[0] == editingId);

        if (rowIndex !== undefined) {
            const currentBooks = table.row(rowIndex).data()[3]; // Keep existing number of books
            table.row(rowIndex).data([
                editingId,
                name,
                works,
                currentBooks,
                description,
                actionButtonsHTML(editingId),
            ]).draw(false);
        }
    } else {
        // Add new
        const newId = getNextAvailableId();
        const randomBooks = Math.floor(Math.random() * 10) + 1; // Random number of books between 1 and 10
        table.row.add([
            newId,
            name,
            works,
            randomBooks,
            description,
            actionButtonsHTML(newId),
        ]).draw(false);
    }

    modalInstance.hide();
    form.reset();
    editingId = null;
    updatePaginationInfo();
}

// Edit author
function editAuthor(id) {
    const rowIndex = table
        .rows()
        .indexes()
        .toArray()
        .find((i) => table.row(i).data()[0] == id);

    if (rowIndex === undefined) {
        console.error(`Author with ID ${id} not found`);
        return;
    }

    const rowData = table.row(rowIndex).data();
    editingId = id;

    document.getElementById('authorName').value = rowData[1];
    document.getElementById('authorWork').value = rowData[2];
    document.getElementById('authorDescription').value = rowData[3];
    document.getElementById('addAuthorModalLabel').innerHTML = '<i class="bi bi-pencil-fill"></i> Ndrysho Autor';
    document.getElementById('submitBtn').innerHTML = '<i class="bi bi-check-circle-fill"></i> Ruaj Ndryshimet';
    modalInstance.show();
}

// Delete author
function deleteAuthor(id) {
    if (confirm('A jeni të sigurt që dëshironi të fshini këtë autor?')) {
        const rowIndex = table
            .rows()
            .indexes()
            .toArray()
            .find((i) => table.row(i).data()[0] == id);

        if (rowIndex !== undefined) {
            table.row(rowIndex).remove().draw(false);
            updatePaginationInfo();
        } else {
            console.error(`Autori me ID ${id} nuk u gjet`);
        }
    }
}
