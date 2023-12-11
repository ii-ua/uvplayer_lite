import style from './Label.module.css';
import PropTypes from 'prop-types';
export default function Label({ title }) {
  return <p className={style.label}>{title}</p>;
}

Label.propTypes = {
  title: PropTypes.string
};
