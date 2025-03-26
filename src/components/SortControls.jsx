import { FaSortUp, FaSortDown } from 'react-icons/fa';

const SortControls = ({ 
    listType, 
    hasRating, 
    sortConfig, 
    handleSort 
}) => {
    const currentSort = sortConfig[listType];
    
    return (
        <div className="d-flex align-items-center gap-2 mb-2 mt-1 justify-content-end pe-4">
            <small className="text-muted">sort by</small>
            <div className="btn-group">
                {['artist', 'year', ...(hasRating ? ['rating'] : [])].map((key) => (
                    <button
                        key={key}
                        className={`btn btn-sm ${
                            currentSort.key === key 
                            ? 'btn-secondary' 
                            : 'btn-outline-secondary'
                        }`}
                        onClick={() => handleSort(listType, key)}
                    >
                        {key === 'artist' && 'artist'}
                        {key === 'year' && 'year'}
                        {key === 'rating' && 'ranking'}
                        {currentSort.key === key && (
                            <span className="ms-2">
                                {currentSort.direction === 'asc' ? <FaSortUp /> : <FaSortDown />}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SortControls;