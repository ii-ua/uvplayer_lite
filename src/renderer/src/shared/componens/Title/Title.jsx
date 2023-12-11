import style from './Title.module.css';
import PropTypes from 'prop-types';
export default function Title({ title }) {
  return <h1 className={style.title}>{title}</h1>;
}

Title.propTypes = {
  title: PropTypes.string
};
