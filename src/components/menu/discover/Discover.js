import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, CardText } from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import { GridList, GridTile } from 'material-ui/GridList';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import CloseIcon from 'material-ui/svg-icons/content/clear';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import { Tabs, Tab } from 'material-ui/Tabs';
import { AutoRotatingCarousel, Slide } from 'material-auto-rotating-carousel'
import SwipeableViews from 'react-swipeable-views';
import { translate, ViewTitle } from 'admin-on-rest';

import { green400, green600, blue400, blue600, red400, red600 } from 'material-ui/styles/colors'


import { changeTheme as changeThemeAction, changeLocale as changeLocaleAction } from './actionReducers';

const styles = {
  label: { width: '10em', display: 'inline-block' },
  button: { margin: '1em' },
  discoverDialogStyle: {
    width: '100%',
    // maxWidth: 'none',
    transform: '',
    transition: 'opacity 1s',
    opacity: 0,
    // display: 'flex',
    // '-ms-flex-direction': 'row',
    // '-webkit-flex-direction': 'row',
    // 'flex-direction': 'row',
    //   '-ms-flex-wrap': 'wrap',
    // '-webkit-flex-wrap': 'wrap',
    // 'flex-wrap': 'wrap',
    maxWidth:'1024px',
    minWidth:'780px',
    backgroundColor: 'transparent'
    // margin-left:auto,margin-right:auto,position:absolute,top:0,right:0,bottom:0,left:0
  },
  overlayStyle: {
    background: 'rgba(0,0,0,.8)'
  },
  toolbarTitleStyle: {
    pointerEvents: 'none',
    color: 'white',
    zIndex: 1000000
  },
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: '100%',
    // height: 450,
    overflowY: 'auto',
  },
};

// TODO: this will be state later
const tilesData = [
  {
    img: 'http://www.material-ui.com/images/grid-list/00-52-29-429_640.jpg',
    title: 'Breakfast',
    author: 'jill111',
    featured: true,
  },
  {
    img: 'http://www.material-ui.com/images/grid-list/burger-827309_640.jpg',
    title: 'Tasty burger',
    author: 'pashminu',
  },
  {
    img: 'http://www.material-ui.com/images/grid-list/camera-813814_640.jpg',
    title: 'Camera',
    author: 'Danson67',
  },
  {
    img: 'http://www.material-ui.com/images/grid-list/morning-819362_640.jpg',
    title: 'Morning',
    author: 'fancycrave1',
    featured: true,
  },
  {
    img: 'http://www.material-ui.com/images/grid-list/hats-829509_640.jpg',
    title: 'Hats',
    author: 'Hans',
  },
  {
    img: 'http://www.material-ui.com/images/grid-list/honey-823614_640.jpg',
    title: 'Honey',
    author: 'fancycravel',
  },
  {
    img: 'http://www.material-ui.com/images/grid-list/vegetables-790022_640.jpg',
    title: 'Vegetables',
    author: 'jill111',
  },
  {
    img: 'http://www.material-ui.com/images/grid-list/water-plant-821293_640.jpg',
    title: 'Water plant',
    author: 'BkrmadtyaKarki',
  },
];

class Discover extends PureComponent {
  constructor(props) {
    super(props)
    this.state = { slideIndex: 0, hiddenElement: true }
  }

  handleChange = (value) => {
    this.setState({slideIndex: value})
  }

  componentDidMount = () => {
    this.setState({hiddenElement: false})
  }

  componentWillUnmount = () => {
    this.setState({hiddenElement: true})
  }

  render() {
    const {theme, locale, changeTheme, changeLocale, menuItemActive, translate} = this.props;

    return (
      <div>
        <Toolbar style={{zIndex: 10000, color: "white", boxShadow: "none"}}>
          <ToolbarGroup>
            <ToolbarTitle style={styles.toolbarTitleStyle} text={translate('pos.discover')}/>
          </ToolbarGroup>
          <ToolbarGroup>
            <IconButton style={{zIndex: 10000}} touch={true} key={'close'} containerElement={<Link to="/"/>}>
              <CloseIcon color={styles.toolbarTitleStyle.color} />
            </IconButton>
          </ToolbarGroup>
        </Toolbar>
        <Dialog open={true}
                contentClassName={(this.state.hiddenElement) ? "" : "classReveal"}
                contentStyle={styles.discoverDialogStyle}

                bodyStyle={{backgroundColor: 'transparent'}}
                actionsContainerStyle={{backgroundColor: red400}}
                overlayStyle={styles.overlayStyle}
                style={{backgroundColor: 'transparent'}}
                titleStyle={{backgroundColor: 'transparent'}}
                autoScrollBodyContent={true}>

          <AutoRotatingCarousel
            style={{position: 'relative', transform: 'none', backgroundColor: 'none'}}
            contentStyle={{transform: 'none', backgroundColor: 'none', height: '512px'}}
            open
            landscape
          >
            <Slide
              media={<img src="http://www.icons101.com/icon_png/size_256/id_79394/youtube.png" />}
              mediaBackgroundStyle={{ backgroundColor: red400 }}
              contentStyle={{ backgroundColor: red600 }}
              title="This is a very cool feature"
              subtitle="Just using this will blow your mind."
            />
            <Slide
              media={<img src="http://www.icons101.com/icon_png/size_256/id_80975/GoogleInbox.png" />}
              mediaBackgroundStyle={{ backgroundColor: blue400 }}
              contentStyle={{ backgroundColor: blue600 }}
              title="Ever wanted to be popular?"
              subtitle="Well just mix two colors and your are good to go!"
            />
            <Slide
              media={<img src="http://www.icons101.com/icon_png/size_256/id_76704/Google_Settings.png" />}
              mediaBackgroundStyle={{ backgroundColor: green400 }}
              contentStyle={{ backgroundColor: green600 }}
              title="May the force be with you"
              subtitle="The Force is a metaphysical and ubiquitous power in the Star Wars universe."
            />
          </AutoRotatingCarousel>

          <Tabs
            onChange={this.handleChange}
            value={this.state.slideIndex}
          >
            <Tab label="EDITOR'S PICKS" value={0} />
            <Tab label="STORIES" value={1} />
            <Tab label="PEOPLE" value={2} />
            <Tab label="BATTLES" value={3} />
            <Tab label="CITIES" value={4} />
            <Tab label="OTHER" value={5} />
          </Tabs>
          <SwipeableViews
            index={this.state.slideIndex}
            onChangeIndex={this.handleChange}>
            {/*// TAB 0*/}
            <div style={styles.root}>
              <GridList
                cols={2}
                cellHeight={200}
                padding={1}
                style={styles.gridList}
              >
                {tilesData.map((tile) => (
                  <GridTile
                    key={tile.img}
                    title={tile.title}
                    actionIcon={<IconButton><StarBorder color="white" /></IconButton>}
                    actionPosition="left"
                    titlePosition="top"
                    titleBackground="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
                    cols={tile.featured ? 2 : 1}
                    rows={tile.featured ? 2 : 1}
                  >
                    <img src={tile.img} />
                  </GridTile>
                ))}
              </GridList>
            </div>
            {/*TAB 1*/}
            <div style={styles.slide}>
              <Card style={{boxShadow: "none"}}>
                <CardText>
                  <div style={styles.label}>{translate('pos.theme.name')}</div>
                  <RaisedButton style={styles.button} label={translate('pos.theme.modern')} primary
                                onClick={() => changeTheme('modern')}/>
                  <RaisedButton style={styles.button} label={translate('pos.theme.historic')} secondary
                                onClick={() => changeTheme('historic')}/>
                </CardText>
                <CardText>
                  <div style={styles.label}>{translate('pos.language')}</div>
                  <RaisedButton style={styles.button} label="en" primary={locale === 'en'}
                                onClick={() => changeLocale('en')}/>
                  <RaisedButton style={styles.button} label="fr" primary={locale === 'fr'}
                                onClick={() => changeLocale('fr')}/>
                </CardText>
              </Card>
            </div>
            {/*TAB 2*/}
            <div style={styles.slide}>
              slide n°3
            </div>
            {/*TAB 3*/}
            <div style={styles.slide}>
              slide n°4
            </div>
            {/*TAB 5*/}
            <div style={styles.slide}>
              slide n°5
            </div>
          </SwipeableViews>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  theme: state.theme,
  locale: state.locale,
  menuItemActive: state.menuItemActive,
});

export default connect(mapStateToProps, {
  changeLocale: changeLocaleAction,
  changeTheme: changeThemeAction,
})(translate(Discover));
