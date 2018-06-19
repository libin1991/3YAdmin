import React from 'react';
import { connect } from 'react-redux';
import { Tabs } from 'antd';
import { withRouter } from 'react-router-dom';
import MenuToRouter from '@/menuMapToRouter';
import menuMapToComponent from '@/menuMapToComponent';
import util from '@/utils/util';
import Home from '@/pages/Home';
import Menu from '@/pages/Menu';
import Function from '@/pages/Function';

const TabPane = Tabs.TabPane;

class MyNavTabs extends React.Component {
  state = {
    currentPage: '',
    openPages: [{
      name: "home",
      title: "首页",
      path: "/app/home",
      closable: false,
      content: React.cloneElement(this.props.content)
    }]
  }
  componentWillReceiveProps(nextProps) {
    console.log("MyNavTabs componentWillReceiveProps")
    if (!nextProps.show) {
      return;
    }
    let name = Object.keys(MenuToRouter).find(key => MenuToRouter[key] === nextProps.location.pathname);
    if (name) {
      if (this.state.openPages.some(s => s.name === name)) {
        if (this.state.currentPage !== name) {
          this.setState({
            currentPage: name
          });
        }
      } else {
        let menu = util.getMenuByName(name, nextProps.accessMenu);
        if (menu.name) {
          let openPages = this.state.openPages;
          openPages.push({
            name: menu.name,
            title: menu.title,
            path: MenuToRouter[menu.name],
            closable: true
          });
          this.setState({
            openPages: openPages,
            currentPage: name
          });
        }
      }
    } else if (nextProps.location.pathname === "/app/home" && this.state.currentPage !== 'home') {
      this.setState({
        currentPage: "home"
      })
    }
  }
  onTabClick = (activeKey) => {
    // if (activeKey !== this.state.currentPage) {
    //   this.setState({
    //     currentPage: activeKey
    //   });
    //   return;
    // }
    if (activeKey !== this.state.currentPage && activeKey === 'home') {
      this.props.history.push('/app/home');
      return;
    }
    if (activeKey !== this.state.currentPage) {
      this.props.history.push(MenuToRouter[activeKey]);
    }
  }
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  }
  remove = (targetKey) => {
    let activeKey = this.state.currentPage;
    let lastIndex;
    this.state.openPages.forEach((pane, i) => {
      if (pane.name === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.openPages.filter(pane => pane.name !== targetKey);
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].name;
    }
    this.setState(
      {
        openPages: panes,
        currentPage: activeKey
      }
    );
    let path = this.state.openPages.filter(s => s.name === activeKey)[0].path;
    this.props.history.push(path);
  }
  render() {
    return (
      <div style={this.props.style}>
        <Tabs
          hideAdd
          activeKey={this.state.currentPage}
          tabBarStyle={{ background: 'white', padding: 10, margin: 0, border: 'none' }}
          type="editable-card"
          onEdit={this.onEdit}
          onTabClick={this.onTabClick}
        >
          {this.state.openPages.map(page => {
            const Page=menuMapToComponent[page.name]?menuMapToComponent[page.name]:menuMapToComponent["page404"];
            return <TabPane forceRender tab={page.title} closable={page.closable} key={page.name}>
              <Page />
              {console.log(page.content)}
            </TabPane>
          }
          )}

        </Tabs>
      </div>
    );
  }
}
const mapStateToProps = state => {
  return {
    accessMenu: state.app.accessMenu
  }
}
export default withRouter(connect(mapStateToProps)(MyNavTabs));