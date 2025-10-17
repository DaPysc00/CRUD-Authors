//Variables
let table;
let editingId = null;
let nextId = 6; // Next ID for new authors
let modalInstance;

// Initialize DataTable
document.addEventListener('DOMContentLoaded', function() {
    table = new DataTable('#authorsTable', {
        pageLength: 10,
        order: [[0, 'asc']],
        language: {
            search: '',
            lengthMenu: '',
            info: '',
            infoEmpty: '',
            emptyTable: 'Nuk ka të dhëna të disponueshme në tabelë',
        },
        columnDefs: [
            { orderable: false, targets: 4 } // Disable ordering on Actions column
        ]
    });

    modalInstance = new bootstrap.Modal(document.getElementById('authorModal'));
    setupPaginationControls();
    updatePaginationInfo();
    });

    // Setup Pagination Controls
function setupPaginationControls() {
    document.getElementById('entriesSelect').addEventListener('change', function() {
        table.page.len(parseInt(this.value)).draw();
        updatePaginationInfo();
    });
    document.getElementById('searchInput').addEventListener('keyup', function() {
        table.search(this.value).draw();
        updatePaginationInfo();
    });
    table.on('draw', function() {
        updatePaginationInfo();
    });
}
    // Update Pagination Info
    function updatePaginationInfo() {
        const info = table.page.info();
        const currentPage = info.page + 1;
        const totalPages = info.pages;

        document.getElementById('pageInfo').textContent = `Faqja ${currentPage} nga ${totalPages}`;
        document.getElementById('infoDisplay').textContent = `Duke treguar ${info.start + 1} nga ${info.end} te ${info.recordsTotal} Autoreve`;

        document.getElementById('prevBtn').disabled = currentPage === 1;
        document.getElementById('nextBtn').disabled = currentPage === totalPages;

    }
    // Go to Previous Page
    function goToPrev() {
        table.page('previous').draw('page');
    }
    // Go to Next Page
    function goToNext() {
        table.page('next').draw('page');
    }

    //Reset form for adding new author
    function resetForm() {
        document.getElementById('authorForm').reset();
        document.getElementById('addAuthorModalLabel').innerHTML = '<i class="bi bi-person-plus-fill"></i> Shto Autor';
        document.getElementById('submitBtn').innerHTML = '< class="bi bi-check-circle-fill"></i> Shto';
        editingId = null;
    }

    //Submit form for adding/editing author
    function submitForm(event) {
        const form = document.getElementById('authorForm');

        if(!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const name = document.getElementById('authorName').value;
        const works = document.getElementById('authorWorks').value;
        const description = document.getElementById('authorDescription').value;

        if(editingId) {
            // Update existing author
            let rowIndex = -1;
            table.rows().every(function(index) {
                const data = this.data();
                if(data[0] == editingId) {
                    rowIndex = index;
                    false;
                }
            });

            if(rowIndex !== -1) {
                table.row(rowIndex).data([
                    editingId,
                    name,
                    works,
                    description,
                    '<button class="btn btn-sm btn-warning me-1" onclick="editAuthor(' + editingId + ')"><i class="bi bi-pencil-fill"></i> Edit</button>' +
                    '<button class="btn btn-sm btn-danger" onclick="deleteAuthor(' + editingId + ')"><i class="bi bi-trash-fill"></i> Delete</button>'
                ]).draw();
            }
        } else {
            // Add new author
            table.row.add([
                nextId++,
                name,
                works,
                description,
                '<button class="btn btn-sm btn-warning me-1" onclick="editAuthor(' + (nextId) + ')"><i class="bi bi-pencil-fill"></i> Edit</button>' +
                '<button class="btn btn-sm btn-danger" onclick="deleteAuthor(' + (nextId) + ')"><i class="bi bi-trash-fill"></i> Delete</button>'
            ]).draw();

            nextId++;
        }

        modalInstance.hide();
        form.reset();
    }
        //edit existing author
    function editAuthor(id) {
        let rowData = null;
        let rowIndex = -1;

        table.rows().every(function(index) {
            const data = this.data();
            if(data[0] == id) {
                rowData = data;
                rowIndex = index;
                return false;
            }
        });

        if(rowData) {
            document.getElementById('authorName').value = rowData[1];
            document.getElementById('authorWorks').value = rowData[2];
            document.getElementById('authorDescription').value = rowData[3];
            document.getElementById('addAuthorModalLabel').innerHTML = '<i class="bi bi-pencil-fill"></i> Ndrysho Autor';
            document.getElementById('submitBtn').innerHTML = '<i class="bi bi-check-circle-fill"></i> Ruaj Ndryshimet';

            modalInstance.show();
        }
    }

    //delete author
    function deleteAuthor(id) {
        if(confirm('A jeni të sigurt që dëshironi të fshini këtë autor?')) {
            let rowIndex = -1;

            table.rows().every(function(index) {
                const data = this.data();
                if(data[0] == id) {
                    rowIndex = index;
                    return false;
                }
            });
            if(rowIndex !== -1) {
                table.row(rowIndex).remove().draw();
            }
        }
    }
    
        