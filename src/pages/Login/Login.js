import { Fragment, useState } from 'react';
import className from 'classnames/bind';
import axios from 'axios';
import styles from './Login.module.scss';
import { useNavigate, Link } from 'react-router-dom';
import images from '~/assets/images/images';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = className.bind(styles);

const Login = () => {
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const expires = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

    const navigate = useNavigate();

    const handleSubmit = () => {
        axios
            .post(`${process.env.REACT_APP_BASE_URL}/Admin/login`, {
                username,
                password,
            })
            .then((res) => {
                Cookies.set('token_admin', res.data.accessToken, { expires });
                navigate(`/`);
                window.location.reload();
            })
            .catch((error) => {
                if (error.response.status === 404) {
                    toast.warn('Vui lòng đăng nhập bằng tài khoản của Admin.', {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'light',
                    });
                }
            });
    };

    return (
        <Fragment>
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
            <div className={cx('modal', 'js-modal-login')}>
                <div className={cx('modal__overlay')}>
                    <img src={images.f8Login} alt="" />
                </div>
                <div className={cx('modal__body')}>
                    <div className={cx('auth-form')}>
                        <div className={cx('auth-form__container', 'js-modal-container-login')}>
                            <div className={cx('auth-form__header')}>
                                <h3 className={cx('auth-form__heading')}>Đăng nhập</h3>
                            </div>

                            <div className={cx('auth-form__form')}>
                                <div className={cx('auth-form__group')}>
                                    <input
                                        type="text"
                                        placeholder="Username của bạn"
                                        name="username"
                                        className={cx('auth-form__input')}
                                        id="auth-form__user-login"
                                        value={username}
                                        onChange={(e) => setUserName(e.target.value)}
                                    />
                                </div>
                                <div className={cx('auth-form__group')}>
                                    <input
                                        type="password"
                                        placeholder="Mật khẩu của bạn"
                                        name="password"
                                        className={cx('auth-form__input')}
                                        id="auth-form__password-login"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={cx('auth-form__aside')}>
                                <p className={cx('auth-form__help')}>
                                    <Link to={''} className={cx('auth-form__help-link', 'auth-form__help-forgot')}>
                                        Quên mật khẩu
                                    </Link>
                                    <span className={cx('auth-form__help-separate')}></span>
                                    <Link to={''} href="" className={cx('auth-form__help-link')}>
                                        Cần trợ giúp?
                                    </Link>
                                </p>
                            </div>

                            <div className={cx('auth-form__control')}>
                                <Link
                                    to={'/'}
                                    className={cx('btn', 'auth-form__control-back', 'btn--normal', 'js-modal-close')}
                                >
                                    TRỞ LẠI
                                </Link>
                                <button
                                    value="login"
                                    className={cx('btn', 'btn--primary', 'view-cart')}
                                    onClick={handleSubmit}
                                    disabled={!username || !password}
                                >
                                    ĐĂNG NHẬP
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}

export default Login;
