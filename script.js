let currentEditingEmployeeId = null;
let currentEditingProductId = null;
let currentEditingCustomerId = null;
let currentEditingSupplierId = null; // New variable for supplier ID
let invoiceCustomersCache = [];

/**
 * Opens a specific tab by adding the 'active' class to its content and corresponding sidebar button.
 * @param {string} tabName - The ID of the tab content to display (e.g., 'nhanvien', 'sanpham', 'khachhang', 'nhacungcap').
 */
function openTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    // Hide all forms when switching tabs
    document.querySelectorAll('.data-form').forEach(form => form.style.display = 'none');
    currentEditingEmployeeId = null;
    currentEditingProductId = null;
    currentEditingCustomerId = null;
    currentEditingSupplierId = null; // Clear supplier editing ID

    // Show the selected tab content
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // Update active state for sidebar buttons
    const sidebarButtons = document.querySelectorAll('.sidebar button');
    sidebarButtons.forEach(button => button.classList.remove('active'));
    const activeButton = Array.from(sidebarButtons).find(button => button.onclick.toString().includes(`openTab('${tabName}')`));
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // Fetch data for the newly opened tab
    if (tabName === 'nhanvien') {
        fetchEmployees();
    } else if (tabName === 'sanpham') {
        fetchProducts();
    } else if (tabName === 'khachhang') {
        fetchCustomers();
    } else if (tabName === 'nhacungcap') { // Fetch suppliers when 'nhacungcap' tab is opened
        fetchSuppliers();
    }
    // No action needed for 'hoadon' as it is a placeholder
}

/**
 * Toggles the visibility of the add or edit employee form.
 * @param {string} formType - 'add' to show add form, 'edit' to show edit form, or null/undefined to hide both.
 * @param {object} [employeeData=null] - Employee data to populate the edit form.
 */
async function toggleEmployeeForm(formType, employeeData = null) {
    const addForm = document.getElementById('add-employee-form');
    const editForm = document.getElementById('edit-employee-form');

    // Hide other forms when dealing with employee forms
    document.getElementById('add-product-form').style.display = 'none';
    document.getElementById('edit-product-form').style.display = 'none';
    document.getElementById('add-customer-form').style.display = 'none';
    document.getElementById('edit-customer-form').style.display = 'none';
    document.getElementById('add-supplier-form').style.display = 'none'; // Hide supplier forms
    document.getElementById('edit-supplier-form').style.display = 'none'; // Hide supplier forms
    currentEditingProductId = null;
    currentEditingCustomerId = null;
    currentEditingSupplierId = null;

    if (formType === 'add') {
        editForm.style.display = 'none'; // Ensure edit form is hidden
        addForm.style.display = addForm.style.display === 'none' ? 'block' : 'none'; // Toggle add form visibility
        currentEditingEmployeeId = null; // Clear editing ID when opening add form

        // If showing the add form, generate the next ID
        if (addForm.style.display === 'block') {
            const nextId = await generateNextEmployeeId();
            document.getElementById('new-employee-id').value = nextId;
            document.getElementById('new-employee-name').focus(); // Focus on the first input field
        } else {
            // Reset the add form when hiding it
            addForm.reset(); // Correctly reset the form
        }

    } else if (formType === 'edit' && employeeData) {
        // If the edit form is currently open AND it's for the same employee, close it
        if (editForm.style.display === 'block' && currentEditingEmployeeId === employeeData.IdNhanVien) {
            editForm.style.display = 'none';
            currentEditingEmployeeId = null; // Clear editing ID
        } else {
            // Otherwise, hide the add form (if open) and show the edit form with new data
            addForm.style.display = 'none';
            editForm.style.display = 'block';
            populateEditEmployeeForm(employeeData);
        }
    } else { // Case for no specific formType or to hide both forms
        addForm.style.display = 'none';
        editForm.style.display = 'none';
        currentEditingEmployeeId = null;
    }
}

/**
 * Populates the edit employee form with the given employee data.
 * @param {object} employee - The employee object.
 */
function populateEditEmployeeForm(employee) {
    document.getElementById('edit-employee-id').value = String(employee.IdNhanVien).padStart(6, '0');
    document.getElementById('edit-employee-name').value = employee.Ten;
    document.getElementById('edit-employee-position').value = employee.ChucVu;
    document.getElementById('edit-employee-dob').value = formatDateForInput(employee.NgayThangNamSinh);
    document.getElementById('edit-employee-address').value = employee.DiaChi;
    document.getElementById('edit-employee-salary').value = parseFloat(employee.Luong);
    currentEditingEmployeeId = employee.IdNhanVien;
}

/**
 * Toggles the visibility of the add or edit product form.
 * @param {string} formType - 'add' to show add form, 'edit' to show edit form, or null/undefined to hide both.
 * @param {object} [productData=null] - Product data to populate the edit form.
 */
async function toggleProductForm(formType, productData = null) {
    const addForm = document.getElementById('add-product-form');
    const editForm = document.getElementById('edit-product-form');

    // Hide other forms when dealing with product forms
    document.getElementById('add-employee-form').style.display = 'none';
    document.getElementById('edit-employee-form').style.display = 'none';
    document.getElementById('add-customer-form').style.display = 'none';
    document.getElementById('edit-customer-form').style.display = 'none';
    document.getElementById('add-supplier-form').style.display = 'none'; // Hide supplier forms
    document.getElementById('edit-supplier-form').style.display = 'none'; // Hide supplier forms
    currentEditingEmployeeId = null;
    currentEditingCustomerId = null;
    currentEditingSupplierId = null;

    if (formType === 'add') {
        editForm.style.display = 'none'; // Ensure edit form is hidden
        addForm.style.display = addForm.style.display === 'none' ? 'block' : 'none'; // Toggle add form visibility
        currentEditingProductId = null; // Clear editing ID when opening add form

        // If showing the add form, generate the next ID
        if (addForm.style.display === 'block') {
            const nextId = await generateNextProductId();
            document.getElementById('new-product-id').value = nextId;
            document.getElementById('new-product-name').focus(); // Focus on the first input field
        } else {
            // Reset the add form when hiding it
            addForm.reset(); // Correctly reset the form
        }

    } else if (formType === 'edit' && productData) {
        // If the edit form is currently open AND it's for the same product, close it
        if (editForm.style.display === 'block' && currentEditingProductId === productData.MaSanPham) {
            editForm.style.display = 'none';
            currentEditingProductId = null; // Clear editing ID
        } else {
            // Otherwise, hide the add form (if open) and show the edit form with new data
            addForm.style.display = 'none';
            editForm.style.display = 'block';
            populateEditProductForm(productData);
        }
    } else { // Case for no specific formType or to hide both forms
        addForm.style.display = 'none';
        editForm.style.display = 'none';
        currentEditingProductId = null;
    }
}

/**
 * Populates the edit product form with the given product data.
 * @param {object} product - The product object.
 */
function populateEditProductForm(product) {
    document.getElementById('edit-product-id').value = String(product.MaSanPham).padStart(6, '0');
    document.getElementById('edit-product-name').value = product.TenSanPham;
    document.getElementById('edit-product-unit').value = product.DonViTinh;
    document.getElementById('edit-product-quantity').value = product.SoLuong;
    document.getElementById('edit-product-mfg-date').value = formatDateForInput(product.NgaySanXuat);
    document.getElementById('edit-product-exp-date').value = formatDateForInput(product.HanSuDung);
    document.getElementById('edit-product-price').value = parseFloat(product.GiaTien);
    currentEditingProductId = product.MaSanPham;
}

/**
 * Toggles the visibility of the add or edit customer form.
 * @param {string} formType - 'add' to show add form, 'edit' to show edit form, or null/undefined to hide both.
 * @param {object} [customerData=null] - Customer data to populate the edit form.
 */
async function toggleCustomerForm(formType, customerData = null) {
    const addForm = document.getElementById('add-customer-form');
    const editForm = document.getElementById('edit-customer-form');

    // Hide other forms when dealing with customer forms
    document.getElementById('add-employee-form').style.display = 'none';
    document.getElementById('edit-employee-form').style.display = 'none';
    document.getElementById('add-product-form').style.display = 'none';
    document.getElementById('edit-product-form').style.display = 'none';
    document.getElementById('add-supplier-form').style.display = 'none'; // Hide supplier forms
    document.getElementById('edit-supplier-form').style.display = 'none'; // Hide supplier forms
    currentEditingEmployeeId = null;
    currentEditingProductId = null;
    currentEditingSupplierId = null;

    if (formType === 'add') {
        editForm.style.display = 'none'; // Ensure edit form is hidden
        addForm.style.display = addForm.style.display === 'none' ? 'block' : 'none'; // Toggle add form visibility
        currentEditingCustomerId = null; // Clear editing ID when opening add form

        // If showing the add form, generate the next ID
        if (addForm.style.display === 'block') {
            const nextId = await generateNextCustomerId();
            document.getElementById('new-customer-id').value = nextId;
            document.getElementById('new-customer-name').focus(); // Focus on the first input field
        } else {
            // Reset the add form when hiding it
            addForm.reset(); // Correctly reset the form
        }

    } else if (formType === 'edit' && customerData) {
        // If the edit form is currently open AND it's for the same customer, close it
        if (editForm.style.display === 'block' && currentEditingCustomerId === customerData.IdKhachHang) {
            editForm.style.display = 'none';
            currentEditingCustomerId = null; // Clear editing ID
        } else {
            // Otherwise, hide the add form (if open) and show the edit form with new data
            addForm.style.display = 'none';
            editForm.style.display = 'block';
            populateEditCustomerForm(customerData);
        }
    } else { // Case for no specific formType or to hide both forms
        addForm.style.display = 'none';
        editForm.style.display = 'none';
        currentEditingCustomerId = null;
    }
}

/**
 * Populates the edit customer form with the given customer data.
 * @param {object} customer - The customer object.
 */
function populateEditCustomerForm(customer) {
    document.getElementById('edit-customer-id').value = String(customer.IdKhachHang).padStart(6, '0');
    document.getElementById('edit-customer-name').value = customer.HoTen;
    document.getElementById('edit-customer-phone').value = customer.SoDienThoai;
    currentEditingCustomerId = customer.IdKhachHang;
}

/**
 * Toggles the visibility of the add or edit supplier form.
 * @param {string} formType - 'add' to show add form, 'edit' to show edit form, or null/undefined to hide both.
 * @param {object} [supplierData=null] - Supplier data to populate the edit form.
 */
async function toggleSupplierForm(formType, supplierData = null) {
    const addForm = document.getElementById('add-supplier-form');
    const editForm = document.getElementById('edit-supplier-form');

    // Hide other forms when dealing with supplier forms
    document.getElementById('add-employee-form').style.display = 'none';
    document.getElementById('edit-employee-form').style.display = 'none';
    document.getElementById('add-product-form').style.display = 'none';
    document.getElementById('edit-product-form').style.display = 'none';
    document.getElementById('add-customer-form').style.display = 'none';
    document.getElementById('edit-customer-form').style.display = 'none';
    currentEditingEmployeeId = null;
    currentEditingProductId = null;
    currentEditingCustomerId = null;

    if (formType === 'add') {
        editForm.style.display = 'none'; // Ensure edit form is hidden
        addForm.style.display = addForm.style.display === 'none' ? 'block' : 'none'; // Toggle add form visibility
        currentEditingSupplierId = null; // Clear editing ID when opening add form

        // If showing the add form, generate the next ID
        if (addForm.style.display === 'block') {
            const nextId = await generateNextSupplierId();
            document.getElementById('new-supplier-id').value = nextId;
            document.getElementById('new-supplier-company-name').focus(); // Focus on the first input field
        } else {
            // Reset the add form when hiding it
            addForm.reset(); // Correctly reset the form
        }

    } else if (formType === 'edit' && supplierData) {
        // If the edit form is currently open AND it's for the same supplier, close it
        if (editForm.style.display === 'block' && currentEditingSupplierId === supplierData.IdNhaCungCap) {
            editForm.style.display = 'none';
            currentEditingSupplierId = null; // Clear editing ID
        } else {
            // Otherwise, hide the add form (if open) and show the edit form with new data
            addForm.style.display = 'none';
            editForm.style.display = 'block';
            populateEditSupplierForm(supplierData);
        }
    } else { // Case for no specific formType or to hide both forms
        addForm.style.display = 'none';
        editForm.style.display = 'none';
        currentEditingSupplierId = null;
    }
}

/**
 * Populates the edit supplier form with the given supplier data.
 * @param {object} supplier - The supplier object.
 */
function populateEditSupplierForm(supplier) {
    document.getElementById('edit-supplier-id').value = String(supplier.IdNhaCungCap).padStart(6, '0');
    document.getElementById('edit-supplier-company-name').value = supplier.TenCongTy;
    document.getElementById('edit-supplier-phone').value = supplier.SoDienThoai;
    document.getElementById('edit-supplier-email').value = supplier.Email;
    currentEditingSupplierId = supplier.IdNhaCungCap;
}

/**
 * Calculates the age based on the date of birth string.
 * @param {string} dobStr - Date of birth string (YYYY-MM-DD).
 * @returns {number} The calculated age.
 */
function calculateAge(dobStr) {
    const birthDate = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

/**
 * Formats a date string to YYYY-MM-DD for display in table.
 * @param {string} dateStr - The date string from API.
 * @returns {string} Formatted date string.
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) { // Check for invalid date
        return 'Invalid Date';
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

/**
 * Formats a date string to YYYY-MM-DD for input type="date" fields.
 * @param {string} dateStr - The date string from API.
 * @returns {string} Formatted date string.
 */
function formatDateForInput(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) { // Check for invalid date
        return ''; // Return empty string for invalid dates in input
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Generates the next available employee ID by finding the maximum existing ID and incrementing it.
 * @returns {Promise<string>} A promise that resolves to the formatted next ID (e.g., "000001").
 */
async function generateNextEmployeeId() {
    try {
        console.log('Generating next employee ID...');
        const response = await fetch('https://btldbs-api.onrender.com/api/nhanvien');
        if (!response.ok) {
            throw new Error('Network response was not ok when fetching employee IDs');
        }
        const data = await response.json();
        console.log('Existing employee IDs fetched for generation:', data.map(emp => emp.IdNhanVien));
        let maxId = 0;
        if (data && data.length > 0) {
            // Map IDs to numbers and find the maximum
            maxId = Math.max(...data.map(emp => emp.IdNhanVien));
        }
        const nextId = maxId + 1;
        console.log('Next generated employee ID:', String(nextId).padStart(6, '0'));
        return String(nextId).padStart(6, '0'); // Format as 000001
    } catch (error) {
        console.error('Error generating next employee ID:', error);
        // Instead of alert, use a custom message box or console log for non-critical errors
        return '';
    }
}


/**
 * Generates the next available product ID by finding the maximum existing ID and incrementing it.
 * @returns {Promise<string>} A promise that resolves to the formatted next ID (e.g., "000001").
 */
async function generateNextProductId() {
    try {
        console.log('Generating next product ID...');
        const response = await fetch('https://btldbs-api.onrender.com/api/sanpham');
        if (!response.ok) {
            throw new Error('Network response was not ok when fetching product IDs');
        }
        const data = await response.json();
        console.log('Existing product IDs fetched for generation:', data.map(prod => prod.MaSanPham));
        let maxId = 0;
        if (data && data.length > 0) {
            // Map IDs to numbers and find the maximum
            maxId = Math.max(...data.map(prod => prod.MaSanPham));
        }
        const nextId = maxId + 1;
        console.log('Next generated product ID:', String(nextId).padStart(6, '0'));
        return String(nextId).padStart(6, '0'); // Format as 000001
    } catch (error) {
        console.error('Error generating next product ID:', error);
        // Instead of alert, use a custom message box or console log for non-critical errors
        return '';
    }
}

/**
 * Generates the next available customer ID by finding the maximum existing ID and incrementing it.
 * @returns {Promise<string>} A promise that resolves to the formatted next ID (e.g., "000001").
 */
async function generateNextCustomerId() {
    try {
        console.log('Generating next customer ID...');
        const response = await fetch('https://btldbs-api.onrender.com/api/khachhang'); // Assuming API endpoint for customers
        if (!response.ok) {
            throw new Error('Network response was not ok when fetching customer IDs');
        }
        const data = await response.json();
        console.log('Existing customer IDs fetched for generation:', data.map(cust => cust.IdKhachHang));
        let maxId = 0;
        if (data && data.length > 0) {
            // Map IDs to numbers and find the maximum
            maxId = Math.max(...data.map(cust => cust.IdKhachHang));
        }
        const nextId = maxId + 1;
        console.log('Next generated customer ID:', String(nextId).padStart(6, '0'));
        return String(nextId).padStart(6, '0'); // Format as 000001
    } catch (error) {
        console.error('Error generating next customer ID:', error);
        return '';
    }
}

/**
 * Generates the next available supplier ID by finding the maximum existing ID and incrementing it.
 * @returns {Promise<string>} A promise that resolves to the formatted next ID (e.g., "000001").
 */
async function generateNextSupplierId() {
    try {
        console.log('Generating next supplier ID...');
        const response = await fetch('https://btldbs-api.onrender.com/api/nhacungcap'); // Assuming API endpoint for suppliers
        if (!response.ok) {
            throw new Error('Network response was not ok when fetching supplier IDs');
        }
        const data = await response.json();
        console.log('Existing supplier IDs fetched for generation:', data.map(sup => sup.IdNhaCungCap));
        let maxId = 0;
        if (data && data.length > 0) {
            // Map IDs to numbers and find the maximum
            maxId = Math.max(...data.map(sup => sup.IdNhaCungCap));
        }
        const nextId = maxId + 1;
        console.log('Next generated supplier ID:', String(nextId).padStart(6, '0'));
        return String(nextId).padStart(6, '0'); // Format as 000001
    } catch (error) {
        console.error('Error generating next supplier ID:', error);
        return '';
    }
}

/**
 * Handles adding a new employee to the database via API.
 */
async function addEmployee() {
    // ID is now auto-generated and readonly, so we get it from the input
    const id = document.getElementById('new-employee-id').value;
    const name = document.getElementById('new-employee-name').value;
    const position = document.getElementById('new-employee-position').value;
    const dobInput = document.getElementById('new-employee-dob').value;
    const address = document.getElementById('new-employee-address').value;
    const salary = document.getElementById('new-employee-salary').value;

    // Basic validation
    if (!id || !name || !position || !dobInput || !address || !salary) {
        alert('Vui lòng điền đầy đủ thông tin nhân viên.'); // Using alert as a simple fallback
        return;
    }

    const newEmployee = {
        IdNhanVien: parseInt(id),
        Ten: name,
        ChucVu: position,
        NgayThangNamSinh: dobInput, // API expects YYYY-MM-DD
        DiaChi: address,
        Luong: parseFloat(salary),
        Tuoi: calculateAge(dobInput)
    };

    console.log('Attempting to add new employee:', newEmployee);

    try {
        const response = await fetch('https://btldbs-api.onrender.com/api/nhanvien', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newEmployee)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi thêm nhân viên: ${response.status} - ${errorText}`);
        }
        const result = await response.json(); // Assuming API returns JSON on success
        console.log('Employee added successfully:', result);

        fetchEmployees(); // Refresh the table
        toggleEmployeeForm('add'); // Close the form
        document.getElementById('add-employee-form').reset(); // Correctly reset the form fields
        alert('Thêm nhân viên thành công!'); // Using alert as a simple fallback
    } catch (error) {
        console.error('Lỗi khi thêm nhân viên:', error);
        alert('Có lỗi xảy ra khi thêm nhân viên.'); // Using alert as a simple fallback
    }
}

/**
 * Handles updating an existing employee in the database via API.
 */
async function updateEmployee() {
    const id = document.getElementById('edit-employee-id').value;
    const name = document.getElementById('edit-employee-name').value;
    const position = document.getElementById('edit-employee-position').value;
    const dobInput = document.getElementById('edit-employee-dob').value;
    const address = document.getElementById('edit-employee-address').value;
    const salary = document.getElementById('edit-employee-salary').value;

    // Basic validation
    if (!name || !position || !dobInput || !address || !salary) {
        alert('Vui lòng điền đầy đủ thông tin.'); // Using alert as a simple fallback
        return;
    }

    const updatedEmployee = {
        IdNhanVien: parseInt(id),
        Ten: name,
        ChucVu: position,
        NgayThangNamSinh: dobInput, // API expects YYYY-MM-DD
        DiaChi: address,
        Luong: parseFloat(salary),
        Tuoi: calculateAge(dobInput)
    };

    console.log('Attempting to update employee:', updatedEmployee);

    try {
        const response = await fetch(`https://btldbs-api.onrender.com/api/nhanvien/${currentEditingEmployeeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedEmployee)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi cập nhật nhân viên: ${response.status} - ${errorText}`);
        }
        const result = await response.json(); // Assuming API returns JSON on success
        console.log('Employee updated successfully:', result);

        fetchEmployees(); // Refresh the table
        toggleEmployeeForm(); // Hide both forms
        currentEditingEmployeeId = null; // Clear editing ID
        alert('Cập nhật nhân viên thành công!'); // Using alert as a simple fallback
    } catch (error) {
        console.error('Lỗi khi cập nhật nhân viên:', error);
        alert('Có lỗi xảy ra khi cập nhật nhân viên.'); // Using alert as a simple fallback
    }
}

/**
 * Handles deleting an employee from the database via API.
 * @param {HTMLElement} button - The delete button element that was clicked.
 */
async function deleteEmployee(button) {
    const row = button.parentNode.parentNode;
    // Get ID from the first cell, remove leading zeros for API call if needed
    const employeeId = parseInt(row.cells[0].textContent);

    console.log(`Attempting to delete employee with ID: ${employeeId}`);
    try {
        const response = await fetch(`https://btldbs-api.onrender.com/api/nhanvien/${employeeId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi xóa nhân viên: ${response.status} - ${errorText}`);
        }
        console.log(`Employee with ID ${employeeId} deleted successfully.`);

        fetchEmployees(); // Refresh the table
        alert(`Đã xóa nhân viên có ID ${String(employeeId).padStart(6, '0')}!`); // Using alert as a simple fallback
    } catch (error) {
        console.error('Lỗi khi xóa nhân viên:', error);
        alert('Có lỗi xảy ra khi xóa nhân viên.'); // Using alert as a simple fallback
    }
}

/**
 * Handles editing an employee by populating the edit form with the selected employee's data.
 * @param {HTMLElement} button - The edit button element that was clicked.
 */
function editEmployee(button) {
    const row = button.parentNode.parentNode;
    const employeeData = {
        IdNhanVien: parseInt(row.cells[0].textContent),
        Ten: row.cells[1].textContent,
        ChucVu: row.cells[2].textContent,
        // When parsing from table, use the displayed format, then convert for input
        NgayThangNamSinh: row.cells[3].textContent,
        DiaChi: row.cells[4].textContent,
        // Remove non-numeric characters and handle comma as decimal for salary
        Luong: parseFloat(row.cells[5].textContent.replace(/[^0-9,.]/g,"").replace(",", ".")),
        Tuoi: parseInt(row.cells[6].textContent),
    };
    console.log('Editing employee:', employeeData);
    toggleEmployeeForm('edit', employeeData);
}

/**
 * Fetches employee data from the API and populates the HTML table.
 */
async function fetchEmployees() {
    console.log('Fetching all employees from API...');
    try {
        const response = await fetch('https://btldbs-api.onrender.com/api/nhanvien');
        if (!response.ok) {
            throw new Error('Lỗi mạng hoặc không tìm thấy tài nguyên');
        }
        const data = await response.json();
        console.log('Received employee data for table update:', data);
        const employeeList = document.getElementById('employee-list');
        employeeList.innerHTML = ''; // Clear old data

        data.forEach(employee => {
            const newRow = employeeList.insertRow();
            const idCell = newRow.insertCell();
            const nameCell = newRow.insertCell();
            const positionCell = newRow.insertCell();
            const dobCell = newRow.insertCell();
            const addressCell = newRow.insertCell();
            const salaryCell = newRow.insertCell();
            const ageCell = newRow.insertCell();
            const actionsCell = newRow.insertCell();
            actionsCell.classList.add('action-buttons');

            idCell.textContent = String(employee.IdNhanVien).padStart(6, '0'); // Format ID here
            nameCell.textContent = employee.Ten;
            positionCell.textContent = employee.ChucVu;
            dobCell.textContent = formatDate(employee.NgayThangNamSinh);
            addressCell.textContent = employee.DiaChi;
            salaryCell.textContent = parseFloat(employee.Luong).toLocaleString('vi-VN'); // Format currency for display
            ageCell.textContent = employee.Tuoi;
            actionsCell.innerHTML = `
                <button class="edit-button" onclick="editEmployee(this)">Sửa</button>
                <button class="delete-button" onclick="deleteEmployee(this)">Xóa</button>
            `;
        });
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu nhân viên từ API:', error);
        alert('Không thể tải dữ liệu nhân viên. Vui lòng thử lại sau.'); // Using alert as a simple fallback
    }
}

/**
 * Handles adding a new product to the database via API.
 */
async function addProduct() {
    const id = document.getElementById('new-product-id').value;
    const name = document.getElementById('new-product-name').value;
    const unit = document.getElementById('new-product-unit').value;
    const quantity = document.getElementById('new-product-quantity').value;
    const mfgDate = document.getElementById('new-product-mfg-date').value;
    const expDate = document.getElementById('new-product-exp-date').value;
    const price = document.getElementById('new-product-price').value;

    if (!id || !name || !unit || !quantity || !mfgDate || !expDate || !price) {
        alert('Vui lòng điền đầy đủ thông tin sản phẩm.');
        return;
    }

    const newProduct = {
        MaSanPham: parseInt(id),
        TenSanPham: name,
        DonViTinh: unit,
        SoLuong: parseInt(quantity),
        NgaySanXuat: mfgDate,
        HanSuDung: expDate,
        GiaTien: parseFloat(price)
    };

    console.log('Attempting to add new product:', newProduct);

    try {
        const response = await fetch('https://btldbs-api.onrender.com/api/sanpham', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProduct)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi thêm sản phẩm: ${response.status} - ${errorText}`);
        }
        const result = await response.json();
        console.log('Product added successfully:', result);

        fetchProducts();
        toggleProductForm('add');
        document.getElementById('add-product-form').reset();
        alert('Thêm sản phẩm thành công!');
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error);
        alert('Có lỗi xảy ra khi thêm sản phẩm.');
    }
}

/**
 * Handles updating an existing product in the database via API.
 */
async function updateProduct() {
    const id = document.getElementById('edit-product-id').value;
    const name = document.getElementById('edit-product-name').value;
    const unit = document.getElementById('edit-product-unit').value;
    const quantity = document.getElementById('edit-product-quantity').value;
    const mfgDate = document.getElementById('edit-product-mfg-date').value;
    const expDate = document.getElementById('edit-product-exp-date').value;
    const price = document.getElementById('edit-product-price').value;

    if (!name || !unit || !quantity || !mfgDate || !expDate || !price) {
        alert('Vui lòng điền đầy đủ thông tin sản phẩm.');
        return;
    }

    const updatedProduct = {
        MaSanPham: parseInt(id),
        TenSanPham: name,
        DonViTinh: unit,
        SoLuong: parseInt(quantity),
        NgaySanXuat: mfgDate,
        HanSuDung: expDate,
        GiaTien: parseFloat(price)
    };

    console.log('Attempting to update product:', updatedProduct);

    try {
        const response = await fetch(`https://btldbs-api.onrender.com/api/sanpham/${currentEditingProductId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProduct)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi cập nhật sản phẩm: ${response.status} - ${errorText}`);
        }
        const result = await response.json();
        console.log('Product updated successfully:', result);

        fetchProducts();
        toggleProductForm(); // Hide both forms
        currentEditingProductId = null;
        alert('Cập nhật sản phẩm thành công!');
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        alert('Có lỗi xảy ra khi cập nhật sản phẩm.');
    }
}

/**
 * Handles deleting a product from the database via API.
 * @param {HTMLElement} button - The delete button element that was clicked.
 */
async function deleteProduct(button) {
    const row = button.parentNode.parentNode;
    const productId = parseInt(row.cells[0].textContent);

    console.log(`Attempting to delete product with ID: ${productId}`);
    try {
        const response = await fetch(`https://btldbs-api.onrender.com/api/sanpham/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi xóa sản phẩm: ${response.status} - ${errorText}`);
        }
        console.log(`Product with ID ${productId} deleted successfully.`);

        fetchProducts();
        alert(`Đã xóa sản phẩm có ID ${String(productId).padStart(6, '0')}!`);
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        alert('Có lỗi xảy ra khi xóa sản phẩm.');
    }
}

/**
 * Handles editing a product by populating the edit form with the selected product's data.
 * @param {HTMLElement} button - The edit button element that was clicked.
 */
function editProduct(button) {
    const row = button.parentNode.parentNode;
    const productData = {
        MaSanPham: parseInt(row.cells[0].textContent),
        TenSanPham: row.cells[1].textContent,
        DonViTinh: row.cells[2].textContent,
        SoLuong: parseInt(row.cells[3].textContent),
        NgaySanXuat: row.cells[4].textContent, // Already YYYY-MM-DD from formatDate
        HanSuDung: row.cells[5].textContent, // Already YYYY-MM-DD from formatDate
        GiaTien: parseFloat(row.cells[6].textContent.replace(/[^0-9,.]/g,"").replace(",", ".")),
    };
    console.log('Editing product:', productData);
    toggleProductForm('edit', productData);
}

/**
 * Fetches product data from the API and populates the HTML table.
 */
async function fetchProducts() {
    console.log('Fetching all products from API...');
    try {
        const response = await fetch('https://btldbs-api.onrender.com/api/sanpham');
        if (!response.ok) {
            throw new Error('Lỗi mạng hoặc không tìm thấy tài nguyên');
        }
        const data = await response.json();
        console.log('Received product data for table update:', data);
        const productList = document.getElementById('product-list');
        productList.innerHTML = ''; // Clear old data

        data.forEach(product => {
            const newRow = productList.insertRow();
            const idCell = newRow.insertCell();
            const nameCell = newRow.insertCell();
            const unitCell = newRow.insertCell();
            const quantityCell = newRow.insertCell();
            const mfgDateCell = newRow.insertCell();
            const expDateCell = newRow.insertCell();
            const priceCell = newRow.insertCell();
            const actionsCell = newRow.insertCell();
            actionsCell.classList.add('action-buttons');

            idCell.textContent = String(product.MaSanPham).padStart(6, '0'); // Format ID here
            nameCell.textContent = product.TenSanPham;
            unitCell.textContent = product.DonViTinh;
            quantityCell.textContent = product.SoLuong;
            mfgDateCell.textContent = formatDate(product.NgaySanXuat);
            expDateCell.textContent = formatDate(product.HanSuDung);
            priceCell.textContent = parseFloat(product.GiaTien).toLocaleString('vi-VN'); // Format currency for display
            actionsCell.innerHTML = `
                <button class="edit-button" onclick="editProduct(this)">Sửa</button>
                <button class="delete-button" onclick="deleteProduct(this)">Xóa</button>
            `;
        });
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu sản phẩm từ API:', error);
        alert('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.');
    }
}

/**
 * Handles adding a new customer to the database via API.
 */
async function addCustomer() {
    const id = document.getElementById('new-customer-id').value;
    const name = document.getElementById('new-customer-name').value;
    const phone = document.getElementById('new-customer-phone').value;

    if (!id || !name || !phone) {
        alert('Vui lòng điền đầy đủ thông tin khách hàng.');
        return;
    }

    const newCustomer = {
        IdKhachHang: parseInt(id),
        HoTen: name,
        SoDienThoai: phone
    };

    console.log('Attempting to add new customer:', newCustomer);

    try {
        const response = await fetch('https://btldbs-api.onrender.com/api/khachhang', { // Assuming API endpoint for customers
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newCustomer)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi thêm khách hàng: ${response.status} - ${errorText}`);
        }
        const result = await response.json();
        console.log('Customer added successfully:', result);

        fetchCustomers();
        toggleCustomerForm('add');
        document.getElementById('add-customer-form').reset();
        alert('Thêm khách hàng thành công!');
    } catch (error) {
        console.error('Lỗi khi thêm khách hàng:', error);
        alert('Có lỗi xảy ra khi thêm khách hàng.');
    }
}

/**
 * Handles updating an existing customer in the database via API.
 */
async function updateCustomer() {
    const id = document.getElementById('edit-customer-id').value;
    const name = document.getElementById('edit-customer-name').value;
    const phone = document.getElementById('edit-customer-phone').value;

    if (!name || !phone) {
        alert('Vui lòng điền đầy đủ thông tin khách hàng.');
        return;
    }

    const updatedCustomer = {
        IdKhachHang: parseInt(id),
        HoTen: name,
        SoDienThoai: phone
    };

    console.log('Attempting to update customer:', updatedCustomer);

    try {
        const response = await fetch(`https://btldbs-api.onrender.com/api/khachhang/${currentEditingCustomerId}`, { // Assuming API endpoint for customers
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedCustomer)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi cập nhật khách hàng: ${response.status} - ${errorText}`);
        }
        const result = await response.json();
        console.log('Customer updated successfully:', result);

        fetchCustomers();
        toggleCustomerForm(); // Hide both forms
        currentEditingCustomerId = null;
        alert('Cập nhật khách hàng thành công!');
    } catch (error) {
        console.error('Lỗi khi cập nhật khách hàng:', error);
        alert('Có lỗi xảy ra khi cập nhật khách hàng.');
    }
}

/**
 * Handles deleting a customer from the database via API.
 * @param {HTMLElement} button - The delete button element that was clicked.
 */
async function deleteCustomer(button) {
    const row = button.parentNode.parentNode;
    const customerId = parseInt(row.cells[0].textContent);

    console.log(`Attempting to delete customer with ID: ${customerId}`);
    try {
        const response = await fetch(`https://btldbs-api.onrender.com/api/khachhang/${customerId}`, { // Assuming API endpoint for customers
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi xóa khách hàng: ${response.status} - ${errorText}`);
        }
        console.log(`Customer with ID ${customerId} deleted successfully.`);

        fetchCustomers();
        alert(`Đã xóa khách hàng có ID ${String(customerId).padStart(6, '0')}!`);
    } catch (error) {
        console.error('Lỗi khi xóa khách hàng:', error);
        alert('Có lỗi xảy ra khi xóa khách hàng.');
    }
}

/**
 * Handles editing a customer by populating the edit form with the selected customer's data.
 * @param {HTMLElement} button - The edit button element that was clicked.
 */
function editCustomer(button) {
    const row = button.parentNode.parentNode;
    const customerData = {
        IdKhachHang: parseInt(row.cells[0].textContent),
        HoTen: row.cells[1].textContent,
        SoDienThoai: row.cells[2].textContent,
    };
    console.log('Editing customer:', customerData);
    toggleCustomerForm('edit', customerData);
}

/**
 * Fetches customer data from the API and populates the HTML table.
 */
async function fetchCustomers() {
    console.log('Fetching all customers from API...');
    try {
        const response = await fetch('https://btldbs-api.onrender.com/api/khachhang'); // Assuming API endpoint for customers
        if (!response.ok) {
            throw new Error('Lỗi mạng hoặc không tìm thấy tài nguyên');
        }
        const data = await response.json();
        console.log('Received customer data for table update:', data);
        const customerList = document.getElementById('customer-list');
        customerList.innerHTML = ''; // Clear old data

        data.forEach(customer => {
            const newRow = customerList.insertRow();
            const idCell = newRow.insertCell();
            const nameCell = newRow.insertCell();
            const phoneCell = newRow.insertCell();
            const actionsCell = newRow.insertCell();
            actionsCell.classList.add('action-buttons');

            idCell.textContent = String(customer.IdKhachHang).padStart(6, '0'); // Format ID here
            nameCell.textContent = customer.HoTen;
            phoneCell.textContent = customer.SoDienThoai;
            actionsCell.innerHTML = `
                <button class="edit-button" onclick="editCustomer(this)">Sửa</button>
                <button class="delete-button" onclick="deleteCustomer(this)">Xóa</button>
            `;
        });
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu khách hàng từ API:', error);
        alert('Không thể tải dữ liệu khách hàng. Vui lòng thử lại sau.');
    }
}

/**
 * Handles adding a new supplier to the database via API.
 */
async function addSupplier() {
    const id = document.getElementById('new-supplier-id').value;
    const companyName = document.getElementById('new-supplier-company-name').value;
    const phone = document.getElementById('new-supplier-phone').value;
    const email = document.getElementById('new-supplier-email').value;

    if (!id || !companyName || !phone || !email) {
        alert('Vui lòng điền đầy đủ thông tin nhà cung cấp.');
        return;
    }

    const newSupplier = {
        IdNhaCungCap: parseInt(id),
        TenCongTy: companyName,
        SoDienThoai: phone,
        Email: email
    };

    console.log('Attempting to add new supplier:', newSupplier);

    try {
        const response = await fetch('https://btldbs-api.onrender.com/api/nhacungcap', { // Assuming API endpoint for suppliers
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newSupplier)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi thêm nhà cung cấp: ${response.status} - ${errorText}`);
        }
        const result = await response.json();
        console.log('Supplier added successfully:', result);

        fetchSuppliers();
        toggleSupplierForm('add');
        document.getElementById('add-supplier-form').reset();
        alert('Thêm nhà cung cấp thành công!');
    } catch (error) {
        console.error('Lỗi khi thêm nhà cung cấp:', error);
        alert('Có lỗi xảy ra khi thêm nhà cung cấp.');
    }
}

/**
 * Handles updating an existing supplier in the database via API.
 */
async function updateSupplier() {
    const id = document.getElementById('edit-supplier-id').value;
    const companyName = document.getElementById('edit-supplier-company-name').value;
    const phone = document.getElementById('edit-supplier-phone').value;
    const email = document.getElementById('edit-supplier-email').value;

    if (!companyName || !phone || !email) {
        alert('Vui lòng điền đầy đủ thông tin nhà cung cấp.');
        return;
    }

    const updatedSupplier = {
        IdNhaCungCap: parseInt(id),
        TenCongTy: companyName,
        SoDienThoai: phone,
        Email: email
    };

    console.log('Attempting to update supplier:', updatedSupplier);

    try {
        const response = await fetch(`https://btldbs-api.onrender.com/api/nhacungcap/${currentEditingSupplierId}`, { // Assuming API endpoint for suppliers
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedSupplier)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi cập nhật nhà cung cấp: ${response.status} - ${errorText}`);
        }
        const result = await response.json();
        console.log('Supplier updated successfully:', result);

        fetchSuppliers();
        toggleSupplierForm(); // Hide both forms
        currentEditingSupplierId = null;
        alert('Cập nhật nhà cung cấp thành công!');
    } catch (error) {
        console.error('Lỗi khi cập nhật nhà cung cấp:', error);
        alert('Có lỗi xảy ra khi cập nhật nhà cung cấp.');
    }
}

/**
 * Handles deleting a supplier from the database via API.
 * @param {HTMLElement} button - The delete button element that was clicked.
 */
async function deleteSupplier(button) {
    const row = button.parentNode.parentNode;
    const supplierId = parseInt(row.cells[0].textContent);

    console.log(`Attempting to delete supplier with ID: ${supplierId}`);
    try {
        const response = await fetch(`https://btldbs-api.onrender.com/api/nhacungcap/${supplierId}`, { // Assuming API endpoint for suppliers
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi xóa nhà cung cấp: ${response.status} - ${errorText}`);
        }
        console.log(`Supplier with ID ${supplierId} deleted successfully.`);

        fetchSuppliers();
        alert(`Đã xóa nhà cung cấp có ID ${String(supplierId).padStart(6, '0')}!`);
    } catch (error) {
        console.error('Lỗi khi xóa nhà cung cấp:', error);
        alert('Có lỗi xảy ra khi xóa nhà cung cấp.');
    }
}

/**
 * Handles editing a supplier by populating the edit form with the selected supplier's data.
 * @param {HTMLElement} button - The edit button element that was clicked.
 */
function editSupplier(button) {
    const row = button.parentNode.parentNode;
    const supplierData = {
        IdNhaCungCap: parseInt(row.cells[0].textContent),
        TenCongTy: row.cells[1].textContent,
        SoDienThoai: row.cells[2].textContent,
        Email: row.cells[3].textContent,
    };
    console.log('Editing supplier:', supplierData);
    toggleSupplierForm('edit', supplierData);
}

/**
 * Fetches supplier data from the API and populates the HTML table.
 */
async function fetchSuppliers() {
    console.log('Fetching all suppliers from API...');
    try {
        const response = await fetch('https://btldbs-api.onrender.com/api/nhacungcap'); // Assuming API endpoint for suppliers
        if (!response.ok) {
            throw new Error('Lỗi mạng hoặc không tìm thấy tài nguyên');
        }
        const data = await response.json();
        console.log('Received supplier data for table update:', data);
        const supplierList = document.getElementById('supplier-list');
        supplierList.innerHTML = ''; // Clear old data

        data.forEach(supplier => {
            const newRow = supplierList.insertRow();
            const idCell = newRow.insertCell();
            const companyNameCell = newRow.insertCell();
            const phoneCell = newRow.insertCell();
            const emailCell = newRow.insertCell();
            const actionsCell = newRow.insertCell();
            actionsCell.classList.add('action-buttons');

            idCell.textContent = String(supplier.IdNhaCungCap).padStart(6, '0'); // Format ID here
            companyNameCell.textContent = supplier.TenCongTy;
            phoneCell.textContent = supplier.SoDienThoai;
            emailCell.textContent = supplier.Email;
            actionsCell.innerHTML = `
                <button class="edit-button" onclick="editSupplier(this)">Sửa</button>
                <button class="delete-button" onclick="deleteSupplier(this)">Xóa</button>
            `;
        });
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu nhà cung cấp từ API:', error);
        alert('Không thể tải dữ liệu nhà cung cấp. Vui lòng thử lại sau.');
    }
}

/**
 * Populates the customer and employee dropdowns in the invoice form.
 */
async function populateInvoiceDropdowns() {
    // Lấy danh sách khách hàng
    try {
        const res = await fetch('https://btldbs-api.onrender.com/api/khachhang');
        invoiceCustomersCache = await res.json();
    } catch {
        invoiceCustomersCache = [];
    }

    // Lấy danh sách nhân viên
    const employeeSelect = document.getElementById('invoice-employee-id');
    employeeSelect.innerHTML = '<option value="">-- Chọn nhân viên --</option>';
    try {
        const res = await fetch('https://btldbs-api.onrender.com/api/nhanvien');
        const employees = await res.json();
        employees.forEach(e => {
            const option = document.createElement('option');
            option.value = e.IdNhanVien;
            option.textContent = `${e.IdNhanVien} - ${e.Ten}`;
            employeeSelect.appendChild(option);
        });
    } catch {}
}

// Gọi khi mở tab hóa đơn
const oldOpenTab = openTab;
openTab = async function(tabName) {
    oldOpenTab(tabName);
    if (tabName === 'hoadon') {
        await populateInvoiceDropdowns();
        // Tự động sinh mã hóa đơn
        const invoiceIdInput = document.getElementById('invoice-id');
        if (invoiceIdInput) {
            invoiceIdInput.value = await generateNextInvoiceId();
        }
        // Tự động set ngày hôm nay cho ngày lập
        const invoiceDateInput = document.getElementById('invoice-date');
        if (invoiceDateInput) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            invoiceDateInput.value = `${yyyy}-${mm}-${dd}`;
        }
        fetchInvoices();
    }
};


// Hàm lưu hóa đơn
async function saveInvoice() {
    const maDon = document.getElementById('invoice-id').value;
    const ngay = document.getElementById('invoice-date').value;
    const phone = document.getElementById('invoice-customer-phone').value.trim();
    const idNhanVien = document.getElementById('invoice-employee-id').value;
    if (!maDon || !ngay || !phone) {
        alert('Vui lòng nhập đầy đủ mã đơn, ngày và số điện thoại khách hàng!');
        return;
    }

    // Tìm khách hàng theo SĐT
    const found = invoiceCustomersCache.find(c => c.SoDienThoai === phone);
    if (!found) {
        alert('Không tìm thấy khách hàng với số điện thoại này!');
        return;
    }

    const idKhachHang = found.IdKhachHang;
    const dateObj = new Date(ngay);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const ngayFormatted = `${yyyy}-${mm}-${dd}`;

    const newInvoice = {
        IdKhachHang: idKhachHang,
        IdNhanVien: idNhanVien ? parseInt(idNhanVien) : 0,
        MaDon: parseInt(maDon),
        Ngay: ngayFormatted, // Định dạng YYYY-MM-DD hoặc GMT string tùy API
        TongTien: parseInt("100000000")
    };

    try {
        const response = await fetch('https://btldbs-api.onrender.com/api/hoadon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newInvoice)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi lưu hóa đơn: ${response.status} - ${errorText}`);
        }
        alert('Lưu hóa đơn thành công!');
        // Reset form nếu muốn
        document.getElementById('invoice-customer-phone').value = '';
        document.getElementById('customer-info').innerHTML = '';
        // Sinh mã mới và ngày mới
        const invoiceIdInput = document.getElementById('invoice-id');
        if (invoiceIdInput) invoiceIdInput.value = await generateNextInvoiceId();
        const invoiceDateInput = document.getElementById('invoice-date');
        if (invoiceDateInput) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            invoiceDateInput.value = `${yyyy}-${mm}-${dd}`;
        }
    } catch (error) {
        console.error('Lỗi khi lưu hóa đơn:', error);
        alert('Có lỗi xảy ra khi lưu hóa đơn.');
    }
    fetchInvoices(); // Cập nhật danh sách hóa đơn
}

async function generateNextInvoiceId() {
    try {
        const res = await fetch('https://btldbs-api.onrender.com/api/hoadon');
        const invoices = await res.json();
        let maxId = 0;
        invoices.forEach(inv => {
            const idNum = parseInt(inv.MaDon, 10);
            if (!isNaN(idNum) && idNum > maxId) maxId = idNum;
        });
        return String(maxId + 1).padStart(6, '0');
    } catch {
        return '000001';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('invoice-customer-phone');
    const infoDiv = document.getElementById('customer-info');
    if (phoneInput && infoDiv) {
        phoneInput.addEventListener('input', function () {
            const value = this.value.trim();
            if (!value) {
                infoDiv.innerHTML = '';
                return;
            }
            const found = invoiceCustomersCache.find(c => c.SoDienThoai === value);
            if (found) {
                infoDiv.innerHTML = `
                    <b>Thông tin khách hàng:</b><br>
                    ID: ${String(found.IdKhachHang).padStart(6, '0')}<br>
                    Họ tên: ${found.HoTen}<br>
                    SĐT: ${found.SoDienThoai}
                `;
            } else {
                infoDiv.innerHTML = '<span style="color:#d32f2f;">Không tìm thấy khách hàng</span>';
            }
        });
    }
});
/**
 * Xóa hóa đơn theo mã đơn (MaDon)
 * @param {number} maDon - Mã đơn của hóa đơn cần xóa
 */
async function deleteInvoice(maDon) {
    if (!confirm(`Bạn có chắc chắn muốn xóa hóa đơn có mã ${String(maDon).padStart(6, '0')}?`)) return;
    try {
        const response = await fetch(`https://btldbs-api.onrender.com/api/hoadon/${maDon}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi xóa hóa đơn: ${response.status} - ${errorText}`);
        }
        alert(`Đã xóa hóa đơn có mã ${String(maDon).padStart(6, '0')}!`);
        fetchInvoices();
    } catch (error) {
        console.error('Lỗi khi xóa hóa đơn:', error);
        alert('Có lỗi xảy ra khi xóa hóa đơn.');
    }
}
async function fetchInvoices() {
    try {
        const res = await fetch('https://btldbs-api.onrender.com/api/hoadon');
        const data = await res.json();
        console.log(data);
        const invoiceList = document.getElementById('invoice-list');
        invoiceList.innerHTML = '';
        data.forEach(inv => {
            const row = invoiceList.insertRow();
            row.insertCell().textContent = inv.IdKhachHang;
            row.insertCell().textContent = inv.IdNhanVien !== null ? inv.IdNhanVien : '';
            row.insertCell().textContent = inv.MaDon;
            row.insertCell().textContent = inv.Ngay.length === 10 ? inv.Ngay : (new Date(inv.Ngay)).toISOString().slice(0,10); // YYYY-MM-DD
            row.insertCell().textContent = Number(inv.TongTien).toLocaleString('vi-VN');
            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `
                <button class="delete-button" onclick="deleteInvoice(${inv.MaDon})">Xóa</button>
            `;
        });
    } catch (error) {
        alert('Không thể tải dữ liệu hóa đơn!');
    }
}