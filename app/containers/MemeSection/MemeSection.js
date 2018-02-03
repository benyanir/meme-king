import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

// actions
import { fetchMyMemes, fetchCategory, fetchWeeklyPopularMemes, fetchNewMemes, fetchAllTimePopularMemes } from 'actions/category-actions/category-actions';
import { addOrRemoveMemeFromCollage } from 'actions/collage-actions/collage-actions';
import { showNotification } from 'actions/notification-actions/notification-actions';

// components
import MemeThumb from 'components/MemeThumb/MemeThumb'
import BtnScrollToTop from '../../components/BtnScrollToTop/BtnScrollToTop';
import Loader from 'components/Loader/Loader';
import MemeSectionBar from 'components/MemeSectionBar/MemeSectionBar';
import SearchInput from 'components/SearchInput/SearchInput';
import Text from 'components/Text/Text';
import CollageSwitcher from 'containers/CollageSwitcher/CollageSwitcher';

// services
import AnalyticsService from 'services/Analytics'

 class MemeSection extends Component {

     state = {
         searchValue : ''
     }

    componentWillMount(){
        this.loadData(this.props.category)
    };

    componentWillReceiveProps(nextProps){
        BtnScrollToTop.scrollToTop();
        if(this.props.category !== nextProps.category) {
            this.loadData(nextProps.category);
            this.setState({ searchValue: '' })
        }
    };


    loadData = (category) => {

        switch (category) {

            case 'my-memes' : {
                this.props.fetchMyMemes();
                break;
            }

            case 'popular' : {
                this.props.fetchWeeklyPopularMemes();
                break;
            }

            case 'new-memes': {
                this.props.fetchNewMemes();
                break;
            }

            case 'all-time-popular': {
                this.props.fetchAllTimePopularMemes();
                break;
            }

            default : {
                this.props.fetchCategory(category);
                break;
            }
        }
    }

     handleCollageClick = (e, meme) => {
        e.preventDefault();
         const { collageMemes, collageMemeLimit, showNotification } = this.props;
         AnalyticsService.sendEvent('add meme to collage clicked');
        if((_.size(collageMemes) === collageMemeLimit) && !_.find(collageMemes, { id: meme.id })) {
            showNotification({ message: `you can't add more than ${collageMemeLimit} memes to the collage`});
            return;
        }

        this.props.addOrRemoveMemeFromCollage(meme);
     }

    render() {

        const { memes, isFetching, category, isCollageMode, collageMemes, collageMemeLimit } = this.props;
        const isPopularSection = (category === 'popular' || category === 'all-time-popular');

        const filteredMemes = _.filter(memes, meme => _.includes( meme.description || '', this.state.searchValue));
        const arrayMemes = _.values(filteredMemes) || [];
        const sortedMemes = isPopularSection ? arrayMemes :  arrayMemes.sort((a, b) => new Date(b.date) - new Date(a.date));
        const memesToShow = (_.size(sortedMemes) > 0 ? sortedMemes : memes);
        const isMemesBeenSearchedAndNoResultsFound =((_.size(this.state.searchValue) > 2) && (_.isEmpty(filteredMemes)))

        return (
            <div className="memes-section">
                <MemeSectionBar theme={isCollageMode ? 'pink' : ''}>

                    <SearchInput onChange={query => this.setState({ searchValue : query })}
                                 clearResults={() => this.setState({ searchValue : '' })}
                                 isFetching={false}
                                 placeholder="חיפוש בקטגוריה"
                                 emptyState={isMemesBeenSearchedAndNoResultsFound}
                                 className="hidden-xs header-search-input"
                                 value={this.state.searchValue}
                                 size="sm"

                    />

                    <CollageSwitcher className="margin-right-small" />

                    {isCollageMode && (
                        <Text
                            size={'md'}
                            weight={200}
                            inline
                            theme={'white'}
                            className="margin-bottom-none margin-top-extra-small margin-right-auto margin-left-small pull-left"
                        >
                            ({_.size(collageMemes)}/{collageMemeLimit})
                        </Text>
                    )}

                </MemeSectionBar>
                {isFetching
                    ?
                    <Loader/>
                    :
                    <div className="memes-container masonry">
                        {_.map(memesToShow, meme =>
                            <MemeThumb
                                shouldShowRatingBadge={category === 'popular' || category ==='all-time-popular'}
                                key={meme.id}
                                isInCollage={_.find(collageMemes, { id: meme.id })}
                                {...meme}
                                onClick={isCollageMode ? (e) => this.handleCollageClick(e, meme) : null}
                                category={category || meme.category }
                            />
                        )}
                    </div>
                }
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {

    return {
       category: ownProps.category,
       memes : state.category.memes,
       isFetching : state.category.isFetching,
       error: state.category.error,
       isCollageMode: state.collage.isCollageMode,
        collageMemes: _.get(state, 'collage.memes', {}),
        collageMemeLimit: _.get(state, 'collage.memes.limig', 4)


    }
}

function mapDispatchToProps(dispatch, ownProps) {

    return {
        fetchCategory: (category) => dispatch(fetchCategory(category)),
        fetchMyMemes: () => dispatch(fetchMyMemes()),
        fetchWeeklyPopularMemes : () => dispatch(fetchWeeklyPopularMemes()),
        fetchNewMemes : () => dispatch(fetchNewMemes()),
        fetchAllTimePopularMemes: () => dispatch(fetchAllTimePopularMemes()),
        addOrRemoveMemeFromCollage : (meme) => dispatch(addOrRemoveMemeFromCollage({ meme })),
        showNotification: (data) => dispatch(showNotification(data))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MemeSection)
