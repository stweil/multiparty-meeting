import React from 'react';
import { connect } from 'react-redux';
import {
	spotlightPeersSelector,
	videoBoxesSelector
} from '../Selectors';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Peer from '../Containers/Peer';
import Me from '../Containers/Me';

const RATIO = 1.334;
const PADDING_V = 50;
const PADDING_H = 0;

const styles = () =>
	({
		root :
		{
			width          : '100%',
			height         : '100%',
			display        : 'flex',
			flexDirection  : 'row',
			flexWrap       : 'wrap',
			justifyContent : 'center',
			alignItems     : 'center',
			alignContent   : 'center'
		},
		hiddenToolBar :
		{
			paddingTop : 0,
			transition : 'padding .5s'
		},
		showingToolBar :
		{
			paddingTop : 60,
			transition : 'padding .5s'
		}
	});

class Democratic extends React.PureComponent
{
	constructor(props)
	{
		super(props);

		this.state = {};

		this.resizeTimeout = null;

		this.peersRef = React.createRef();
	}

	updateDimensions = () =>
	{
		if (!this.peersRef.current)
		{
			return;
		}

		const n = this.props.boxes;

		if (n === 0)
		{
			return;
		}

		const width = this.peersRef.current.clientWidth - PADDING_H;
		const height = this.peersRef.current.clientHeight -
			(this.props.toolbarsVisible || this.props.permanentTopBar ? PADDING_V : PADDING_H);

		let x, y, space;

		for (let rows = 1; rows < 100; rows = rows + 1)
		{
			x = width / Math.ceil(n / rows);
			y = x / RATIO;
			if (height < (y * rows))
			{
				y = height / rows;
				x = RATIO * y;
				break;
			}
			space = height - (y * (rows));
			if (space < y)
			{
				break;
			}
		}
		if (Math.ceil(this.state.peerWidth) !== Math.ceil(0.94 * x))
		{
			this.setState({
				peerWidth  : 0.94 * x,
				peerHeight : 0.94 * y
			});
		}
	};

	componentDidMount()
	{
		// window.resize event listener
		window.addEventListener('resize', () =>
		{
			// clear the timeout
			clearTimeout(this.resizeTimeout);

			// start timing for event "completion"
			this.resizeTimeout = setTimeout(() => this.updateDimensions(), 250);
		});

		this.updateDimensions();
	}

	componentWillUnmount()
	{
		window.removeEventListener('resize', this.updateDimensions);
	}

	componentDidUpdate(prevProps)
	{
		if (prevProps !== this.props)
			this.updateDimensions();
	}

	render()
	{
		const {
			advancedMode,
			spotlightsPeers,
			toolbarsVisible,
			permanentTopBar,
			classes
		} = this.props;

		const style =
		{
			'width'  : this.state.peerWidth ? this.state.peerWidth : 0,
			'height' : this.state.peerHeight ? this.state.peerHeight : 0
		};

		return (
			<div
				className={classnames(
					classes.root,
					toolbarsVisible || permanentTopBar ? classes.showingToolBar : classes.hiddenToolBar
				)}
				ref={this.peersRef}
			>
				<Me
					advancedMode={advancedMode}
					spacing={6}
					style={style}
				/>
				{ spotlightsPeers.map((peer) =>
				{
					return (
						<Peer
							key={peer}
							advancedMode={advancedMode}
							id={peer}
							spacing={6}
							style={style}
						/>
					);
				})}
			</div>
		);
	}
}

Democratic.propTypes =
{
	advancedMode     : PropTypes.bool,
	boxes            : PropTypes.number,
	spotlightsPeers  : PropTypes.array.isRequired,
	toolbarsVisible  : PropTypes.bool.isRequired,
	permanentTopBar     : PropTypes.bool,
	classes          : PropTypes.object.isRequired
};

const mapStateToProps = (state) =>
{
	return {
		boxes           : videoBoxesSelector(state),
		spotlightsPeers : spotlightPeersSelector(state),
		toolbarsVisible : state.room.toolbarsVisible,
		permanentTopBar    : state.settings.permanentTopBar
	};
};

export default connect(
	mapStateToProps,
	null,
	null,
	{
		areStatesEqual : (next, prev) =>
		{
			return (
				prev.peers === next.peers &&
				prev.producers === next.producers &&
				prev.consumers === next.consumers &&
				prev.room.spotlights === next.room.spotlights &&
				prev.room.toolbarsVisible === next.room.toolbarsVisible &&
				prev.settings.permanentTopBar === next.settings.permanentTopBar
			);
		}
	}
)(withStyles(styles)(Democratic));
