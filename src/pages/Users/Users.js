import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrashIcon, UpdateIcon } from '~/components/Icons';
import ReactPaginate from 'react-paginate';
import { useNavigate } from 'react-router-dom';
import className from 'classnames/bind';
import styles from './Users.module.scss';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as request from '~/utils/request';

const cx = className.bind(styles);

const Users = () => {
    const navigate = useNavigate();
    const [checkedDelete, setCheckedDelete] = useState(false);
    const [productIdDelete, setProductIdDelete] = useState();
    const [pageCount, setPageCount] = useState(0);
    const [currentPageProduct, setCurrentPageProduct] = useState(1);
    const [users, setUsers] = useState([]);
    const [modalType, setModalType] = useState(null); // 'add', 'update', or null
    const [userFormData, setUserFormData] = useState({
        id: null,
        username: '',
        email: '',
        password: '',
        fullname: '',
        profile_pic: null,
        is_active: true,
        is_staff: false,
    });

    const postsPerPage = 8;

    const getUsers = async (page) => {
        try {
            const res = await request.get(`/api/admin/get-users?page=${page}&limit=${postsPerPage}`);
            setUsers(res.data);
            setPageCount(res.page_count);
        } catch (error) {
            console.error('Error fetching users:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await request.get('/api/admin/get-users');
                setUsers(res.data);
                setPageCount(res.page_count);
            } catch (error) {
                console.error('Error fetching genres:', error);
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            }
        })();
    }, [navigate]);

    // Hàm lưu (thêm hoặc cập nhật) người dùng
    const handleSaveUser = async () => {
        if (!userFormData.username.trim() || !userFormData.email.trim() || !userFormData.fullname.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }
        if (modalType === 'add' && !userFormData.password.trim()) {
            toast.error('Please enter a password for the new user');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('username', userFormData.username);
            formData.append('email', userFormData.email);
            formData.append('fullname', userFormData.fullname);
            formData.append('is_active', userFormData.is_active);
            formData.append('is_staff', userFormData.is_staff);
            if (userFormData.password) {
                formData.append('password', userFormData.password);
            }
            if (userFormData.profile_pic) {
                formData.append('profile_pic', userFormData.profile_pic);
            }

            if (modalType === 'add') {
                const data = await request.post('/api/admin/add-user', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setUsers([...users, data]);
                toast.success('User added successfully');
            } else if (modalType === 'update') {
                const data = await request.put(`/api/admin/update-user/${userFormData.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setUsers(users.map((user) => (user.id === data.id ? data : user)));
                toast.success('User updated successfully');
            }
            setModalType(null);
            setUserFormData({
                id: null,
                username: '',
                email: '',
                password: '',
                fullname: '',
                profile_pic: null,
                is_active: true,
                is_staff: false,
            });
        } catch (error) {
            console.error(`Error ${modalType === 'add' ? 'adding' : 'updating'} user:`, error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                toast.error(`Failed to ${modalType === 'add' ? 'add' : 'update'} user. Please try again.`);
            }
        }
    };

    const handleDeleteUser = async () => {
        if (!productIdDelete) return;
        try {
            await request.delete_method(`/api/admin/delete-user/${productIdDelete}`);
            setUsers(users.filter((user) => user.id !== parseInt(productIdDelete)));
            setCheckedDelete(false);
            setProductIdDelete(null);
            toast.success('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                toast.error('Failed to delete user. Please try again.');
            }
        }
    };

    // Hàm mở modal cập nhật
    const handleEditUser = (user) => {
        setUserFormData({
            id: user.id,
            username: user.username,
            email: user.email,
            password: '',
            fullname: user.fullname,
            profile_pic: null,
            is_active: user.is_active,
            is_staff: user.is_staff,
        });
        setModalType('update');
    };

    // Hàm xử lý checkbox xóa
    const handleCheckDelete = (event) => {
        const targetId = event.currentTarget.dataset.id;
        setCheckedDelete(!checkedDelete);
        setProductIdDelete(targetId);
    };

    // Hàm xử lý phân trang
    const handlePageClick = (event) => {
        const currentPage = event.selected + 1;
        getUsers(currentPage);
        setCurrentPageProduct(currentPage);
    };

    // Hàm xử lý chọn file ảnh
    const handleFileChange = (e) => {
        setUserFormData({ ...userFormData, profile_pic: e.target.files[0] });
    };

    return (
        <div className={cx('container_m')}>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <div className={cx('mt-4', 'mb-4', 'pd-top-20px')}>
                <div className={cx('action')}>
                    <div className={cx('action-container')}>
                        <div className={cx('actions-wrap')}>
                            <div className={cx('action-list')}>
                                <button
                                    className={cx('btn', 'btn--primary', 'mr-10')}
                                    onClick={() => {
                                        setUserFormData({
                                            id: null,
                                            username: '',
                                            email: '',
                                            password: '',
                                            fullname: '',
                                            profile_pic: null,
                                            is_active: true,
                                            is_staff: false,
                                        });
                                        setModalType('add');
                                    }}
                                >
                                    Add User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cx('table-wrap', 'mt-4')}>
                    <div className={cx('table-container')}>
                        <table className={cx('table')}>
                            <thead>
                                <tr>
                                    <th scope="col">Username</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Fullname</th>
                                    <th scope="col">Active</th>
                                    <th scope="col">Staff</th>
                                    <th scope="col" style={{ textAlign: 'center' }} colSpan="2">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>{user.fullname}</td>
                                            <td>{user.is_active ? 'Yes' : 'No'}</td>
                                            <td>{user.is_staff ? 'Yes' : 'No'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <span
                                                        className={cx('btn-delete')}
                                                        data-id={user.id}
                                                        onClick={(e) => handleCheckDelete(e)}
                                                    >
                                                        <TrashIcon fill={'#eb5959'} />
                                                    </span>
                                                    <div
                                                        className={cx('btn-edit')}
                                                        onClick={() => handleEditUser(user)}
                                                    >
                                                        <UpdateIcon fill={'#1b8fd7'} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className={cx('text-center')}>
                                            No users available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {pageCount > 0 && (
                    <div className={styles['pagination-container']}>
                        <ReactPaginate
                            onPageChange={handlePageClick}
                            previousLabel={'<'}
                            breakLabel={'...'}
                            nextLabel={'>'}
                            pageCount={pageCount}
                            marginPagesDisplayed={3}
                            pageRangeDisplayed={3}
                            containerClassName={'pagination_custom'}
                            pageClassName={'page-item_custom'}
                            pageLinkClassName={'page-link_custom'}
                            previousClassName={'page-item_custom'}
                            previousLinkClassName={'page-link_custom'}
                            nextClassName={'page-item_custom'}
                            nextLinkClassName={'page-link_custom'}
                        />
                    </div>
                )}
            </div>

            {/* Modal delete user */}
            {checkedDelete && (
                <div className={cx('modal')}>
                    <div className={cx('modal__overlay')} onClick={() => setCheckedDelete(false)} />
                    <div className={cx('modal__body')}>
                        <div className={cx('auth-form')}>
                            <div className={cx('auth-form__container')}>
                                <div className={cx('auth-form__header')}>
                                    <TrashIcon fill={'#ff5556'} />
                                </div>
                                <div>
                                    <h3>Are you sure?</h3>
                                    <p>
                                        Do you really want to permanently delete this user? This action cannot be
                                        undone!
                                    </p>
                                </div>
                                <div className={cx('auth-form__control')}>
                                    <button
                                        className={cx('btn', 'btn--normal', 'mr-10')}
                                        onClick={() => setCheckedDelete(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button className={cx('btn', 'btn--primary')} onClick={handleDeleteUser}>
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal add/update */}
            {modalType && (
                <div className={cx('modal')}>
                    <div className={cx('modal__overlay')} onClick={() => setModalType(null)} />
                    <div className={cx('modal__body')}>
                        <div className={cx('auth-form')}>
                            <div className={cx('auth-form__container')}>
                                <h3 className={cx('auth-form__header')}>
                                    {modalType === 'add' ? 'Add New User' : 'Update User'}
                                </h3>
                                <div className={cx('form-group')}>
                                    <label htmlFor="username">Username</label>
                                    <input
                                        type="text"
                                        className={cx('form-control-input')}
                                        id="username"
                                        value={userFormData.username}
                                        onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        className={cx('form-control-input')}
                                        id="email"
                                        value={userFormData.email}
                                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label htmlFor="password">
                                        Password {modalType === 'update' && '(leave blank if unchanged)'}
                                    </label>
                                    <input
                                        type="password"
                                        className={cx('form-control-input')}
                                        id="password"
                                        value={userFormData.password}
                                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label htmlFor="fullname">Full Name</label>
                                    <input
                                        type="text"
                                        className={cx('form-control-input')}
                                        id="fullname"
                                        value={userFormData.fullname}
                                        onChange={(e) => setUserFormData({ ...userFormData, fullname: e.target.value })}
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label htmlFor="profile_pic">Profile Picture</label>
                                    <input
                                        type="file"
                                        className={cx('form-control-input')}
                                        id="profile_pic"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={userFormData.is_active}
                                            onChange={(e) =>
                                                setUserFormData({ ...userFormData, is_active: e.target.checked })
                                            }
                                        />
                                        Active
                                    </label>
                                </div>
                                <div className={cx('form-group')}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={userFormData.is_staff}
                                            onChange={(e) =>
                                                setUserFormData({ ...userFormData, is_staff: e.target.checked })
                                            }
                                        />
                                        Staff
                                    </label>
                                </div>
                                <div className={cx('auth-form__control')}>
                                    <button
                                        className={cx('btn', 'btn--normal', 'mr-10')}
                                        onClick={() => setModalType(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button className={cx('btn', 'btn--primary')} onClick={handleSaveUser}>
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
