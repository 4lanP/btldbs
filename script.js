let currentEditingEmployeeId = null;
        let currentEditingProductId = null;
        let currentEditingCustomerId = null;
        let currentEditingSupplierId = null; // New variable for supplier ID
let invoiceCustomersCache = [];
let productsCache = [];

        /**
         * Opens a specific tab by adding the 'active' class to its content and corresponding sidebar button.
         * @param {string} tabName - The ID of the tab content to display (e.g., 'nhanvien', 'sanpham', 'khachhang', 'nhacungcap').
         */
async function openTab(tabName) {
            // Hide all tab contents
    const tabContents = document.getElementsByClassName('tab-content');
    for (let content of tabContents) {
        content.classList.remove('active');
    }

            // Hide all forms when switching tabs
            document.querySelectorAll('.data-form').forEach(form => form.style.display = 'none');
            currentEditingEmployeeId = null;
            currentEditingProductId = null;
            currentEditingCustomerId = null;
            currentEditingSupplierId = null; // Clear supplier editing ID

            // Show the selected tab content
    document.getElementById(tabName).classList.add('active');

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
    } else if (tabName === 'hoadon') {
        populateInvoiceDropdowns();
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
        await populateProductDropdown();
        fetchInvoices();
    } else if (tabName === 'nhaphang') {
        // Tự động sinh mã phiếu nhập
        const importIdInput = document.getElementById('import-id');
        if (importIdInput) {
            importIdInput.value = await generateNextImportId();
        }
        // Tự động set ngày hôm nay cho ngày nhập
        const importDateInput = document.getElementById('import-date');
        if (importDateInput) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            importDateInput.value = `${yyyy}-${mm}-${dd}`;
        }
        await populateImportDropdowns();
        // Reset bảng tạm
        document.getElementById('imported-items-list').innerHTML = '';
        document.getElementById('import-total-amount').value = '';
    }
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
    document.getElementById('edit-product-id').value = product.MaSanPham;
            document.getElementById('edit-product-name').value = product.TenSanPham;
            document.getElementById('edit-product-unit').value = product.DonViTinh;
            document.getElementById('edit-product-quantity').value = product.SoLuong;
    document.getElementById('edit-product-purchase-price').value = product.GiaTienNhap;
    document.getElementById('edit-product-sale-price').value = product.GiaTienBan;
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
    const purchasePrice = document.getElementById('new-product-purchase-price').value;
    const salePrice = document.getElementById('new-product-sale-price').value;

    if (!name || !unit || !quantity || !purchasePrice || !salePrice) {
                alert('Vui lòng điền đầy đủ thông tin sản phẩm.');
                return;
            }

            const newProduct = {
                MaSanPham: parseInt(id),
                TenSanPham: name,
                DonViTinh: unit,
                SoLuong: parseInt(quantity),
        GiaTienNhap: parseFloat(purchasePrice),
        GiaTienBan: parseFloat(salePrice)
            };

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
        toggleProductForm();
                alert('Thêm sản phẩm thành công!');
            } catch (error) {
                console.error('Lỗi khi thêm sản phẩm:', error);
        alert('Lỗi khi thêm sản phẩm: ' + error.message);
            }
        }

        /**
         * Handles updating an existing product in the database via API.
         */
        async function updateProduct() {
            let id = document.getElementById('edit-product-id').value;
            // Đảm bảo id là số nguyên, loại bỏ số 0 ở đầu nếu có
            id = parseInt(id, 10);
            if (!id || isNaN(id)) {
                alert('ID sản phẩm không hợp lệ!');
                return;
            }
            const name = document.getElementById('edit-product-name').value;
            const unit = document.getElementById('edit-product-unit').value;
            const quantity = document.getElementById('edit-product-quantity').value;
            const purchasePrice = document.getElementById('edit-product-purchase-price').value;
            const salePrice = document.getElementById('edit-product-sale-price').value;

            if (!name || !unit || !quantity || !purchasePrice || !salePrice) {
                alert('Vui lòng điền đầy đủ thông tin sản phẩm.');
                return;
            }

            const updatedProduct = {
                MaSanPham: id,
                TenSanPham: name,
                DonViTinh: unit,
                SoLuong: parseInt(quantity),
                GiaTienNhap: parseFloat(purchasePrice),
                GiaTienBan: parseFloat(salePrice)
            };

            // Log chi tiết để debug
            console.log('PUT URL:', `https://btldbs-api.onrender.com/api/sanpham/${id}`);
            console.log('PUT body:', updatedProduct);

            try {
                const response = await fetch(`https://btldbs-api.onrender.com/api/sanpham/${id}`, {
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
                toggleProductForm();
                alert('Cập nhật sản phẩm thành công!');
            } catch (error) {
                console.error('Lỗi khi cập nhật sản phẩm:', error);
                alert('Lỗi khi cập nhật sản phẩm: ' + error.message);
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
        GiaTienNhap: parseFloat(row.cells[4].textContent),
        GiaTienBan: parseFloat(row.cells[5].textContent),
            };
            console.log('Editing product:', productData);
            toggleProductForm('edit', productData);
        }

        /**
         * Fetches product data from the API and populates the HTML table.
         */
        async function fetchProducts() {
            try {
                const response = await fetch('https://btldbs-api.onrender.com/api/sanpham');
        const products = await response.json();
                const productList = document.getElementById('product-list');
        productList.innerHTML = '';

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.MaSanPham}</td>
                <td>${product.TenSanPham}</td>
                <td>${product.DonViTinh}</td>
                <td>${product.SoLuong}</td>
                <td>${product.GiaTienNhap}</td>
                <td>${product.GiaTienBan}</td>
                <td class="action-buttons">
                        <button class="edit-button" onclick="editProduct(this)">Sửa</button>
                        <button class="delete-button" onclick="deleteProduct(this)">Xóa</button>
                </td>
                    `;
            productList.appendChild(row);
                });
            } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error);
        alert('Lỗi khi lấy danh sách sản phẩm: ' + error.message);
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

async function populateProductDropdown() {
    try {
        const response = await fetch('https://btldbs-api.onrender.com/api/sanpham');
        productsCache = await response.json();

        const productSelect = document.querySelector('.product-select');
        productSelect.innerHTML = '<option value="">-- Chọn sản phẩm --</option>';

        productsCache.forEach(product => {
            const option = document.createElement('option');
            option.value = product.MaSanPham;
            option.textContent = `${product.MaSanPham} - ${product.TenSanPham}`;
            productSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

async function addChiTietHoaDonItem() {
    const productSelect = document.querySelector('.product-select');
    const quantityInput = document.querySelector('.quantity');
    
    const productId = parseInt(productSelect.value);
    const quantity = parseInt(quantityInput.value);
    
    if (!productId || !quantity) {
        alert('Vui lòng chọn sản phẩm và nhập số lượng!');
        return;
    }
    
    // Fetch products if cache is empty
    if (productsCache.length === 0) {
        await populateProductDropdown();
    }
    
    const product = productsCache.find(p => p.MaSanPham === productId);
    if (!product) {
        alert('Không tìm thấy sản phẩm!');
        return;
    }
    
    // Check if product is already in the list
    const existingRow = document.querySelector(`#added-items-list tr[data-product-id="${productId}"]`);
    if (existingRow) {
        alert('Sản phẩm này đã được thêm vào hóa đơn!');
        return;
    }
    
    const donGia = product.GiaTienBan; // Sử dụng giá bán
    const thanhTien = donGia * quantity;
    
    const newRow = document.createElement('tr');
    newRow.dataset.productId = productId;
    newRow.innerHTML = `
        <td>${productId}</td>
        <td>${product.TenSanPham}</td>
        <td>${quantity}</td>
        <td>${donGia.toLocaleString()}đ</td>
        <td>${thanhTien.toLocaleString()}đ</td>
        <td>
            <button onclick="removeAddedItem(this)" class="remove-item">Xóa</button>
        </td>
    `;
    
    document.getElementById('added-items-list').appendChild(newRow);
    calculateTotal();
    
    // Reset input fields
    productSelect.value = '';
    quantityInput.value = '1';
}

function removeAddedItem(button) {
    const row = button.closest('tr');
    row.remove();
    calculateTotal();
}

function calculateTotal() {
    const rows = document.querySelectorAll('#added-items-list tr');
    let total = 0;

    rows.forEach(row => {
        // Lấy thành tiền, loại bỏ ký tự không phải số, dấu phẩy và chữ đ
        let thanhTienStr = row.cells[4].textContent.replace(/[^\d,]/g, '').replace(/,/g, '');
        let thanhTien = parseFloat(thanhTienStr);
        if (!isNaN(thanhTien)) total += thanhTien;
    });

    document.getElementById('total-amount').value = total;
}

async function saveInvoice() {
    const maDon = document.getElementById('invoice-id').value;
    const ngay = document.getElementById('invoice-date').value;
    const idKhachHang = document.getElementById('customer-info').dataset.id;
    const idNhanVien = document.getElementById('invoice-employee-id').value;
    const tongTien = document.getElementById('total-amount').value;

    if (!maDon || !ngay || !idKhachHang || !idNhanVien) {
        alert('Vui lòng điền đầy đủ thông tin hóa đơn');
        return;
    }

    const addedItems = document.querySelectorAll('#added-items-list tr');
    if (addedItems.length === 0) {
        alert('Vui lòng thêm ít nhất một sản phẩm vào hóa đơn');
        return;
    }

    try {
        // Save HoaDon
        const hoadonResponse = await fetch('https://btldbs-api.onrender.com/api/hoadon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                MaDon: parseInt(maDon),
                Ngay: ngay,
                TongTien: parseFloat(tongTien),
                IdKhachHang: parseInt(idKhachHang),
                IdNhanVien: parseInt(idNhanVien)
            })
        });

        if (!hoadonResponse.ok) {
            throw new Error('Failed to save hóa đơn');
        }

        // Save ChiTietHoaDon items & cập nhật số lượng sản phẩm
        for (const row of addedItems) {
            const maSanPham = parseInt(row.dataset.productId);
            const soLuong = parseInt(row.cells[2].textContent);
            const donGia = parseFloat(row.cells[3].textContent.replace(/[^0-9.-]/g, ''));

            // 1. Lưu chi tiết hóa đơn
            const chiTietResponse = await fetch('https://btldbs-api.onrender.com/api/chitiethoadon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    MaDon: parseInt(maDon),
                    MaSanPham: maSanPham,
                    SoLuong: soLuong,
                    DonGia: donGia
                })
            });

            if (!chiTietResponse.ok) {
                throw new Error('Failed to save chi tiết hóa đơn');
            }

            // 2. Lấy sản phẩm hiện tại từ API
            let product = null;
            try {
                const prodRes = await fetch(`https://btldbs-api.onrender.com/api/sanpham/${maSanPham}`);
                if (prodRes.ok) product = await prodRes.json();
            } catch {}
            if (product) {
                const newQuantity = Math.max(0, product.SoLuong - soLuong);
                const updatedProduct = {
                    MaSanPham: parseInt(product.MaSanPham),
                    TenSanPham: product.TenSanPham,
                    DonViTinh: product.DonViTinh,
                    SoLuong: Math.max(0, Number.isFinite(Number(newQuantity)) ? parseInt(newQuantity) : 0),
                    GiaTienNhap: Number.isFinite(Number(product.GiaTienNhap)) ? parseFloat(product.GiaTienNhap) : 0,
                    GiaTienBan: Number.isFinite(Number(product.GiaTienBan)) && parseFloat(product.GiaTienBan) >= 0
                        ? parseFloat(product.GiaTienBan)
                        : (Number.isFinite(Number(product.GiaTienNhap)) ? parseFloat(product.GiaTienNhap) : 0)
                };
                // Log chi tiết từng trường và kiểu dữ liệu
                Object.keys(updatedProduct).forEach(key => {
                    console.log(`updatedProduct[${key}] =`, updatedProduct[key], '| typeof:', typeof updatedProduct[key]);
                });
                console.log('PUT cập nhật sản phẩm:', updatedProduct);
                await fetch(`https://btldbs-api.onrender.com/api/sanpham/${product.MaSanPham}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedProduct)
                });
            }
        }

        alert('Lưu hóa đơn thành công!');
        await fetchInvoices();
        await fetchProducts(); // Cập nhật lại bảng sản phẩm
        resetInvoiceForm();
    } catch (error) {
        console.error('Error saving invoice:', error);
        alert('Có lỗi xảy ra khi lưu hóa đơn');
    }
}

async function resetInvoiceForm() {
    document.getElementById('invoice-date').value = '';
    document.getElementById('invoice-customer-phone').value = '';
    document.getElementById('customer-info').innerHTML = '';
    document.getElementById('customer-info').dataset.id = '';
    document.getElementById('invoice-employee-id').value = '';
    document.getElementById('total-amount').value = '';
    document.getElementById('added-items-list').innerHTML = '';
    const invoiceIdInput = document.getElementById('invoice-id');
    if (invoiceIdInput) {
        invoiceIdInput.value = await generateNextInvoiceId();
    }
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
                infoDiv.dataset.id = '';
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
                infoDiv.dataset.id = found.IdKhachHang;
            } else {
                infoDiv.innerHTML = '<span style="color:#d32f2f;">Không tìm thấy khách hàng</span>';
                infoDiv.dataset.id = '';
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
        // Update invoice-id input after deletion
        const invoiceIdInput = document.getElementById('invoice-id');
        if (invoiceIdInput) {
            invoiceIdInput.value = await generateNextInvoiceId();
        }
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
                <button class="detail-button" onclick="showInvoiceDetail(${inv.MaDon})">Chi tiết</button>
                <button class="delete-button" onclick="deleteInvoice(${inv.MaDon})">Xóa</button>
            `;
        });
    } catch (error) {
        alert('Không thể tải dữ liệu hóa đơn!');
    }
}

// Modal functions for invoice detail
function closeInvoiceDetailModal() {
    document.getElementById('invoice-detail-modal').style.display = 'none';
    document.getElementById('invoice-detail-content').innerHTML = '';
}

function closeInvoiceDetailModal() {
    document.getElementById('invoice-detail-modal').style.display = 'none';
    document.getElementById('invoice-detail-content').innerHTML = '';
}

async function showInvoiceDetail(maDon) {
    document.getElementById('invoice-detail-modal').style.display = 'block';
    const contentDiv = document.getElementById('invoice-detail-content');
    contentDiv.innerHTML = '<div style="text-align:center; color:#1976d2;">Đang tải chi tiết...</div>';
    try {
        const res = await fetch(`https://btldbs-api.onrender.com/api/chitiethoadon?madon=${maDon}`);
        if (!res.ok) {
            throw new Error('Failed to fetch invoice details');
        }
        const details = await res.json();
        // Filter details by MaDon to ensure only the selected invoice's details are shown
        const filteredDetails = details.filter(item => item.MaDon == maDon);

        if (!filteredDetails || filteredDetails.length === 0) {
            contentDiv.innerHTML = '<div style="color:#d32f2f;">Không có chi tiết hóa đơn.</div>';
            return;
        }
        let html = `<table><thead><tr><th>Mã sản phẩm</th><th>Tên sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>`;
        for (const item of filteredDetails) {
            let tenSanPham = '';
            if (productsCache && productsCache.length > 0) {
                const prod = productsCache.find(p => p.MaSanPham === item.MaSanPham);
                if (prod) tenSanPham = prod.TenSanPham;
            }
            html += `<tr>
                <td>${item.MaSanPham}</td>
                <td>${tenSanPham || ''}</td>
                <td>${item.SoLuong}</td>
                <td>${Number(item.DonGia).toLocaleString('vi-VN')}</td>
                <td>${Number(item.SoLuong * item.DonGia).toLocaleString('vi-VN')}</td>
            </tr>`;
        }
        html += '</tbody></table>';
        contentDiv.innerHTML = html;
    } catch (error) {
        contentDiv.innerHTML = '<div style="color:#d32f2f;">Lỗi khi tải chi tiết hóa đơn.</div>';
    }
}

// --- Nhập hàng ---
async function populateImportDropdowns() {
    // Nhà cung cấp
    const supplierSelect = document.getElementById('import-supplier-id');
    supplierSelect.innerHTML = '<option value="">-- Chọn nhà cung cấp --</option>';
    try {
        const res = await fetch('https://btldbs-api.onrender.com/api/nhacungcap');
        const suppliers = await res.json();
        suppliers.forEach(sup => {
            const option = document.createElement('option');
            option.value = sup.IdNhaCungCap;
            option.textContent = `${sup.IdNhaCungCap} - ${sup.TenCongTy}`;
            supplierSelect.appendChild(option);
        });
    } catch {}
    // Nhân viên
    const employeeSelect = document.getElementById('import-employee-id');
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
    // Sản phẩm
    const productSelect = document.querySelector('.import-product-select');
    productSelect.innerHTML = '<option value="">-- Chọn sản phẩm --</option>';
    let products = [];
    try {
        const res = await fetch('https://btldbs-api.onrender.com/api/sanpham');
        products = await res.json();
        products.forEach(p => {
            const option = document.createElement('option');
            option.value = p.MaSanPham;
            option.textContent = `${p.MaSanPham} - ${p.TenSanPham}`;
            productSelect.appendChild(option);
        });
    } catch {}
    // Thêm option thêm sản phẩm mới
    const newOption = document.createElement('option');
    newOption.value = 'new';
    newOption.textContent = '-- Thêm sản phẩm mới --';
    productSelect.appendChild(newOption);
    // Sự kiện thay đổi dropdown
    productSelect.onchange = function() {
        const priceInput = document.querySelector('.import-price');
        const newProductForm = document.getElementById('new-product-form');
        if (this.value === 'new') {
            newProductForm.style.display = 'block';
            priceInput.value = '';
            priceInput.disabled = true;
        } else if (this.value) {
            newProductForm.style.display = 'none';
            const prod = products.find(p => p.MaSanPham == this.value);
            if (prod) {
                priceInput.value = prod.GiaTienNhap;
                priceInput.disabled = true;
            } else {
                priceInput.value = '';
                priceInput.disabled = false;
            }
        } else {
            newProductForm.style.display = 'none';
            priceInput.value = '';
            priceInput.disabled = false;
        }
    };
}

async function generateNextImportId() {
    try {
        const res = await fetch('https://btldbs-api.onrender.com/api/donnhaphang');
        const orders = await res.json();
        let maxId = 0;
        orders.forEach(o => {
            const idNum = parseInt(o.MaDon, 10);
            if (!isNaN(idNum) && idNum > maxId) maxId = idNum;
        });
        return String(maxId + 1).padStart(6, '0');
    } catch {
        return '000001';
    }
}

async function addChiTietNhapHangItem() {
    const productSelect = document.querySelector('.import-product-select');
    const quantityInput = document.querySelector('.import-quantity');
    const priceInput = document.querySelector('.import-price');
    const productId = productSelect.value;
    const quantity = parseInt(quantityInput.value);
    let donGia = parseFloat(priceInput.value);
    let tenSanPham = '';
    let maSanPham = null;
    let isNewProduct = false;
    if (!productId) {
        alert('Vui lòng chọn sản phẩm!');
        return;
    }
    if (productId === 'new') {
        // Sản phẩm mới
        isNewProduct = true;
        tenSanPham = document.getElementById('new-import-product-name').value;
        const donViTinh = document.getElementById('new-import-product-unit').value;
        const giaNhap = document.getElementById('new-import-product-purchase-price').value;
        const giaBan = document.getElementById('new-import-product-sale-price').value;
        if (!tenSanPham || !donViTinh || !giaNhap || !giaBan || !quantity) {
            alert('Vui lòng nhập đầy đủ thông tin sản phẩm mới và số lượng!');
            return;
        }
        // Tạo sản phẩm mới qua API, set SoLuong = quantity
        let newId = 1;
        try {
            const res = await fetch('https://btldbs-api.onrender.com/api/sanpham');
            const products = await res.json();
            if (products.length > 0) {
                newId = Math.max(...products.map(p => p.MaSanPham)) + 1;
            }
        } catch {}
        const newProduct = {
            MaSanPham: newId,
            TenSanPham: tenSanPham,
            DonViTinh: donViTinh,
            SoLuong: quantity, // set đúng số lượng nhập
            GiaTienNhap: parseFloat(giaNhap),
            GiaTienBan: parseFloat(giaBan)
        };
        try {
            const res = await fetch('https://btldbs-api.onrender.com/api/sanpham', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
            if (!res.ok) throw new Error('Tạo sản phẩm mới thất bại');
            maSanPham = newId;
            donGia = parseFloat(giaNhap);
        } catch (e) {
            alert('Không thể tạo sản phẩm mới!');
            return;
        }
    } else {
        // Sản phẩm cũ
        maSanPham = parseInt(productId);
        // Lấy tên sản phẩm
        try {
            const res = await fetch('https://btldbs-api.onrender.com/api/sanpham');
            const products = await res.json();
            const prod = products.find(p => p.MaSanPham === maSanPham);
            if (prod) {
                tenSanPham = prod.TenSanPham;
                donGia = prod.GiaTienNhap;
            }
        } catch {}
    }
    // Check trùng
    const existingRow = document.querySelector(`#imported-items-list tr[data-product-id="${maSanPham}"]`);
    if (existingRow) {
        alert('Sản phẩm này đã được thêm vào phiếu nhập!');
        return;
    }
    const thanhTien = donGia * quantity;
    const newRow = document.createElement('tr');
    newRow.dataset.productId = maSanPham;
    if (isNewProduct) newRow.dataset.isNewProduct = '1';
    newRow.innerHTML = `
        <td>${maSanPham}</td>
        <td>${tenSanPham}</td>
        <td>${quantity}</td>
        <td>${donGia.toLocaleString()}đ</td>
        <td>${thanhTien.toLocaleString()}đ</td>
        <td><button onclick="removeImportedItem(this)" class="remove-item">Xóa</button></td>
    `;
    document.getElementById('imported-items-list').appendChild(newRow);
    calculateImportTotal();
    // Reset input
    productSelect.value = '';
    quantityInput.value = '1';
    priceInput.value = '';
    document.getElementById('new-product-form').style.display = 'none';
    document.getElementById('new-import-product-name').value = '';
    document.getElementById('new-import-product-unit').value = '';
    document.getElementById('new-import-product-purchase-price').value = '';
    document.getElementById('new-import-product-sale-price').value = '';
}

function removeImportedItem(button) {
    const row = button.closest('tr');
    row.remove();
    calculateImportTotal();
}

function calculateImportTotal() {
    const rows = document.querySelectorAll('#imported-items-list tr');
    let total = 0;
    rows.forEach(row => {
        let thanhTienStr = row.cells[4].textContent.replace(/[^0-9,]/g, '').replace(/,/g, '');
        let thanhTien = parseFloat(thanhTienStr);
        if (!isNaN(thanhTien)) total += thanhTien;
    });
    document.getElementById('import-total-amount').value = total;
}

async function saveImportOrder() {
    const maDon = document.getElementById('import-id').value;
    const ngay = document.getElementById('import-date').value;
    const idNhaCungCap = document.getElementById('import-supplier-id').value;
    const idNhanVien = document.getElementById('import-employee-id').value;
    const tongTien = document.getElementById('import-total-amount').value;
    if (!maDon || !ngay || !idNhaCungCap || !idNhanVien) {
        alert('Vui lòng điền đầy đủ thông tin phiếu nhập');
        return;
    }
    const addedItems = document.querySelectorAll('#imported-items-list tr');
    if (addedItems.length === 0) {
        alert('Vui lòng thêm ít nhất một sản phẩm vào phiếu nhập');
        return;
    }
    try {
        // Lưu DonNhapHang
        const donNhapResponse = await fetch('https://btldbs-api.onrender.com/api/donnhaphang', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                MaDon: parseInt(maDon),
                Ngay: ngay,
                TongTien: parseFloat(tongTien),
                IdNhaCungCap: parseInt(idNhaCungCap),
                IdNhanVien: parseInt(idNhanVien)
            })
        });
        if (!donNhapResponse.ok) throw new Error('Lưu phiếu nhập thất bại');
        // Lưu ChiTietNhapHang và cập nhật số lượng sản phẩm
        for (const row of addedItems) {
            const maSanPham = parseInt(row.dataset.productId);
            const soLuong = parseInt(row.cells[2].textContent);
            const donGia = parseFloat(row.cells[3].textContent.replace(/[^0-9.-]/g, ''));
            // 1. Lưu chi tiết nhập hàng
            const chiTietResponse = await fetch('https://btldbs-api.onrender.com/api/chitietnhaphang', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    MaDon: parseInt(maDon),
                    MaSanPham: maSanPham,
                    SoLuong: soLuong,
                    DonGia: donGia
                })
            });
            if (!chiTietResponse.ok) throw new Error('Lưu chi tiết nhập hàng thất bại');
            // 2. Lấy sản phẩm hiện tại
            let product = null;
            try {
                const prodRes = await fetch(`https://btldbs-api.onrender.com/api/sanpham/${maSanPham}`);
                if (prodRes.ok) product = await prodRes.json();
            } catch {}
            // Nếu là sản phẩm mới (isNewProduct), không cộng thêm số lượng nữa
            const isNewProduct = row.dataset.isNewProduct === '1';
            if (product && !isNewProduct) {
                const oldQuantity = Number(product.SoLuong) || 0;
                const newQuantity = oldQuantity + soLuong;
                const updatedProduct = {
                    MaSanPham: parseInt(product.MaSanPham),
                    TenSanPham: product.TenSanPham,
                    DonViTinh: product.DonViTinh,
                    SoLuong: Math.max(0, Number.isFinite(Number(newQuantity)) ? parseInt(newQuantity) : 0),
                    GiaTienNhap: Number.isFinite(Number(product.GiaTienNhap)) ? parseFloat(product.GiaTienNhap) : 0,
                    GiaTienBan: Number.isFinite(Number(product.GiaTienBan)) && parseFloat(product.GiaTienBan) >= 0
                        ? parseFloat(product.GiaTienBan)
                        : (Number.isFinite(Number(product.GiaTienNhap)) ? parseFloat(product.GiaTienNhap) : 0)
                };
                // Log chi tiết từng trường và kiểu dữ liệu
                Object.keys(updatedProduct).forEach(key => {
                    console.log(`updatedProduct[${key}] =`, updatedProduct[key], '| typeof:', typeof updatedProduct[key]);
                });
                console.log('PUT cập nhật sản phẩm:', updatedProduct);
                await fetch(`https://btldbs-api.onrender.com/api/sanpham/${product.MaSanPham}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedProduct)
                });
            }
        }
        alert('Lưu phiếu nhập thành công!');
        await fetchProducts(); // Cập nhật lại bảng sản phẩm
        // Reset form
        openTab('nhaphang');
    } catch (error) {
        console.error('Lỗi khi lưu phiếu nhập:', error);
        alert('Có lỗi xảy ra khi lưu phiếu nhập');
    }
}