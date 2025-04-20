import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrashIcon, UpdateIcon } from '~/components/Icons';
import ReactPaginate from 'react-paginate';
import { useNavigate } from 'react-router-dom';
import className from 'classnames/bind';
import styles from './Songs.module.scss';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as request from '~/utils/request';
import axios from 'axios';

const cx = className.bind(styles);

const Songs = () => {
    const navigate = useNavigate();
    const [checkedDelete, setCheckedDelete] = useState(false);
    const [songIdToDelete, setSongIdDelete] = useState();
    const [pageCount, setPageCount] = useState();
    const [currentPageSong, setCurrentPageSong] = useState();

    const [title, setTitle] = useState('');
    const [selectedArtist, setSelectedArtist] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [duration, setDuration] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [audioFile, setAudioFile] = useState(null);

    const [artists, setArtists] = useState([]);
    const [genres, setGenres] = useState([]);
    const [songs, setSongs] = useState([]);

    const [modalType, setModalType] = useState(null);
    const [songToEdit, setSongToEdit] = useState(null);

    const postsPerPage = 10;

    const getSongs = async (currentPage) => {
        try {
            const res = await request.get(`/api/admin/get-songs?page=${currentPage}&limit=${postsPerPage}`);
            
            setSongs(res.data);
            setPageCount(res.page_count);
        } catch (error) {
            if (error.response.status === 401) navigate('/login');
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const [artistRes, genreRes] = await Promise.all([
                    request.get('/api/admin/get-artists'),
                    request.get('/api/admin/get-genres'),
                ]);
                setArtists(artistRes);
                setGenres(genreRes);
            } catch (err) {
                console.error(err);
                navigate('/login');
            }
        })();
    }, [navigate]);

    useEffect(() => {
        (async () => {
            try {
                const res = await request.get(`/api/admin/get-songs`);
                setSongs(res.data);
                setPageCount(res.page_count);
                console.log(res);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            }
        })();
    }, [navigate]);

    const handleCheckDelete = (event) => {
        const targetId = event.currentTarget.dataset.id;
        setCheckedDelete(!checkedDelete);
        setSongIdDelete(targetId);
    };

    const handleDeleteSong = async () => {
        try {
            await request.delete_method(`/api/admin/delete-song/${songIdToDelete}`);
            setCheckedDelete(!checkedDelete);
            getSongs(currentPageSong || 1);
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                console.error('Lỗi khi xóa bài hát:', error);
            }
        }
    };

    const handleAddSong = async () => {
        if (!title || !selectedArtist || !selectedGenre || !duration || !releaseDate || !audioFile) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('duration', duration);
        formData.append('release_date', releaseDate);
        formData.append('artist_id', selectedArtist);
        formData.append('genre_id', selectedGenre);
        formData.append('audio_file', audioFile);

        try {
            const res = await fetch(`${process.env.REACT_APP_BASE_URL}api/admin/add-song`, {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const rs = await res.json();
                setSongs((prevSongs) => [...prevSongs, rs]);
                setTitle('');
                setSelectedArtist('');
                setSelectedGenre('');
                setDuration('');
                setReleaseDate('');
                setAudioFile(null);
                // setCheckedBtnAddSong(false);
            } else {
                await res.json();
            }
        } catch (error) {
            console.error('Lỗi kết nối:', error);
        }
    };

    const handlePageClick = (event) => {
        let currentPage = event.selected + 1;
        getSongs(currentPage);
        setCurrentPageSong(currentPage);
    };

    const handleUpdateSong = async () => {
        console.log(title, selectedArtist, selectedGenre, duration, releaseDate, audioFile);
        if (!title || !selectedArtist || !selectedGenre || !duration || !releaseDate) {
            return;
        }
        const formData = new FormData();
        formData.append('title', title);
        formData.append('duration', duration);
        formData.append('release_date', releaseDate);
        formData.append('artist_id', selectedArtist);
        formData.append('genre_id', selectedGenre);
        if (audioFile) formData.append('audio_file', audioFile);

        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
        
        try {
            const res = await axios.put(
                `${process.env.REACT_APP_BASE_URL}api/admin/update-song/${songToEdit.id}/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );
            console.log(res)

            const updated = res.data;
            setSongs((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            setModalType(null);
            setSongToEdit(null);
        } catch (error) {
            if (error.response) {
                console.error('Lỗi từ server:', error.response.data);
            } else {
                console.error('Lỗi kết nối:', error.message);
            }
        }
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
                                        setModalType('add');
                                        setTitle('');
                                        setDuration('');
                                        setReleaseDate('');
                                        setSelectedArtist('');
                                        setSelectedGenre('');
                                        setAudioFile(null);
                                        setSongToEdit(null);
                                    }}
                                >
                                    Add song
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
                                    <th scope="col">Name</th>
                                    <th scope="col">Artist</th>
                                    <th scope="col" style={{ textAlign: 'center' }}>
                                        Genre
                                    </th>
                                    <th scope="col" style={{ textAlign: 'center' }}>
                                        Release date
                                    </th>
                                    <th scope="col" style={{ textAlign: 'center' }}>
                                        Play count
                                    </th>
                                    <th scope="col" style={{ textAlign: 'center' }}>
                                        Audition
                                    </th>
                                    <th scope="col" style={{ textAlign: 'center' }} colSpan="2">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {songs.length > 0 ? (
                                    songs.map((song) => (
                                        <tr key={song.id}>
                                            <td>{song.title}</td>
                                            <td>{song.artist_info.name}</td>
                                            <td style={{ textAlign: 'center' }}>{song.genre_info.name}</td>
                                            <td style={{ textAlign: 'center' }}>{song.release_date}</td>
                                            <td style={{ textAlign: 'center' }}>{song.play_count}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <audio
                                                    controls
                                                    src={song.audio_url}
                                                    style={{ width: '150px', height: '44px' }}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <span
                                                        className={cx('btn-delete')}
                                                        data-id={song.id}
                                                        onClick={handleCheckDelete}
                                                    >
                                                        <TrashIcon fill={'#eb5959'} />
                                                    </span>
                                                    <div
                                                        className={cx('btn-edit')}
                                                        data-id={song.id}
                                                        onClick={() => {
                                                            setModalType('edit');
                                                            setSongToEdit(song);
                                                            setTitle(song.title);
                                                            setDuration(song.duration);
                                                            setReleaseDate(song.release_date);
                                                            setSelectedArtist(song.artist_info.id);
                                                            setSelectedGenre(song.genre_info.id);
                                                            setAudioFile(null);
                                                        }}
                                                    >
                                                        <UpdateIcon fill={'#1b8fd7'} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className={cx('text-center')}>
                                            Chưa có bài hát nào.
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

            {checkedDelete && (
                <div className={cx('modal')}>
                    <div className={cx('modal__overlay')}></div>
                    <div className={cx('modal__body')}>
                        <div className={cx('auth-form')}>
                            <div className={cx('auth-form__container', 'js-modal-container-login')}>
                                <div className={cx('auth-form__header')}>
                                    <TrashIcon fill={'#ff5556'} />
                                </div>

                                <div>
                                    <h3>Bạn chắc chắn chưa!</h3>
                                    <p>
                                        Bạn có thực sự muốn xóa vĩnh viễn sản phẩm này? Bạn không thể khôi phục sản phẩm
                                        này nữa nếu bạn xóa vĩnh viễn!
                                    </p>
                                </div>

                                <div className={cx('auth-form__control')}>
                                    <Link
                                        to={'/songs'}
                                        onClick={() => setCheckedDelete(false)}
                                        className={cx('btn', 'auth-form__control-back', 'btn--normal')}
                                    >
                                        Trở lại
                                    </Link>
                                    <button
                                        onClick={() => {
                                            if (songIdToDelete) handleDeleteSong();
                                        }}
                                        value="login"
                                        className={cx('btn', 'btn--primary', 'view-cart')}
                                    >
                                        Tiếp tục
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalType && (
                <div className={cx('modal')}>
                    <div className={cx('modal__overlay')} />
                    <div className={cx('modal__body')}>
                        <div className={cx('auth-form')}>
                            <div className={cx('auth-form__container')}>
                                <h3 className={cx('auth-form__header')}>
                                    {modalType === 'add' ? 'Thêm bài hát' : 'Cập nhật bài hát'}
                                </h3>
                                <div className={cx('form-group')}>
                                    <label htmlFor="title">Tên bài hát</label>
                                    <input
                                        type="text"
                                        className={cx('form-control-input')}
                                        name="title"
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div className={cx('form-group', 'mb-8')}>
                                    <label htmlFor="releaseDate">Ngày phát hành</label>
                                    <input
                                        type="date"
                                        className={cx('form-control-input')}
                                        id="releaseDate"
                                        value={releaseDate}
                                        onChange={(e) => setReleaseDate(e.target.value)}
                                    />
                                </div>

                                <div className={cx('form-group', 'mb-8')}>
                                    <label htmlFor="artist">Nghệ sĩ</label>
                                    <select
                                        id="artist"
                                        className={cx('form-control-input')}
                                        value={selectedArtist}
                                        onChange={(e) => setSelectedArtist(e.target.value)}
                                    >
                                        <option value="">-- Chọn nghệ sĩ --</option>
                                        {artists.map((artist) => (
                                            <option key={artist.id} value={artist.id}>
                                                {artist.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={cx('form-group', 'mb-8')}>
                                    <label htmlFor="genre">Thể loại</label>
                                    <select
                                        id="genre"
                                        className={cx('form-control-input')}
                                        value={selectedGenre}
                                        onChange={(e) => setSelectedGenre(e.target.value)}
                                    >
                                        <option value="">-- Chọn thể loại --</option>
                                        {genres.map((genre) => (
                                            <option key={genre.id} value={genre.id}>
                                                {genre.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={cx('form-group', 'mb-8')}>
                                    <label htmlFor="duration">Thời lượng (giây)</label>
                                    <input
                                        type="number"
                                        className={cx('form-control-input')}
                                        id="duration"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                    />
                                </div>

                                <div className={cx('form-group', 'mb-8')}>
                                    <label htmlFor="audioFile">Tệp nhạc</label>
                                    <input
                                        type="file"
                                        className={cx('form-control-input')}
                                        id="audioFile"
                                        accept="audio/*"
                                        onChange={(e) => setAudioFile(e.target.files[0])}
                                    />
                                </div>

                                <div className={cx('auth-form__control')}>
                                    <button
                                        className={cx('btn', 'btn--normal', 'mr-10')}
                                        onClick={() => {
                                            setModalType(null);
                                            setSongToEdit(null);
                                        }}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        className={cx('btn', 'btn--primary')}
                                        onClick={() => {
                                            modalType === 'add' ? handleAddSong() : handleUpdateSong();
                                        }}
                                    >
                                        {modalType === 'add' ? 'Thêm' : 'Cập nhật'}
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

export default Songs;
