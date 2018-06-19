import _ from 'lodash'
import React  from 'react'
import LazyLoad from 'react-lazyload'
import classNames from 'classnames'
import PropTypes from 'prop-types'

// components
import { Link } from 'react-router-dom'
import Icon from 'components/Icon/Icon'

// constants
import globalConstants from 'constants/global'

// helpers
import helpers from 'helpers/helpers'

// assets
import smallCrown from 'assets/images/small-crown.png'

const RatingCrown = ({ left, right, icon, rating }) => (
    <span className={classNames("rating-crown", { top }, { right }, { left })}>
        {!icon && <img src={smallCrown} className="crown"/>}
        {icon && <Icon name="TROPHY" block />}
        <span className="block">{rating}</span>
    </span>
)

const MemeThumb = ({
                       thumbPath,
                       description,
                       rating,
                       theme,
                       isFavourite,
                       isLoggedIn,
                       to,
                       urlPath,
                       addToFavourites,
                       removeFromFavorites,
                       onClick,
                       shouldShowRatingBadge,
                       className,
                       hidden,
                       isInCollage,
                       ...rest

                }) => {
                    const computedRating = (rating * 4) + helpers.getRandomNumber(0, 1)

                    if (hidden) {
                        return null;
                    }

                    return (

                        <Link
                            to={to}
                            className={classNames(className, 'meme-thumb', `theme-${theme}`, { 'marked-in-collage': isInCollage })}
                            onClick={onClick}
                            {...rest}
                        >
                            <img src={thumbPath || urlPath} alt={description} className="meme-thumb__img"/>
                            {(shouldShowRatingBadge && rating) && (
                                <RatingCrown rating={computedRating} />
                            )}
                            {isInCollage && (
                                <Icon className="in-collage-badge" theme="pink" name="CHECK"/>
                            )}

                            <div className="meme-thumb__overlay">
                                <p className="description weight-600">
                                    {description}
                                </p>

                                {isLoggedIn && (
                                    <Icon
                                        name="HEART"
                                        onClick={isFavourite ? removeFromFavorites : addToFavourites}
                                        className="like-heart"
                                        theme={isFavourite ? 'success': "white-success"}
                                    />
                                )}

                                {!shouldShowRatingBadge && <RatingCrown rating={computedRating} icon />}
                            </div>
                        </Link>

                    )
}

MemeThumb.propTypes = {
    theme: PropTypes.oneOf(['full-width', 'default'])
}

MemeThumb.defaultProps = {
    theme: 'default',
    onClick(){},
}

export default  MemeThumb