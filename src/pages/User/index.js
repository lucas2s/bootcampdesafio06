import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  Loading,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  state = {
    stars: [],
    loading: false,
    loadingMore: false,
    noMore: false,
    page: 1,
    refreshing: false,
  };

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  componentDidMount() {
    this.setState({ loading: true });
    const { page } = this.state;
    this.loadStars(page);
  }

  loadMore = () => {
    const { noMore } = this.state;
    if (!noMore) {
      const { loadingMore } = this.state;
      if (!loadingMore) {
        this.setState({ loadingMore: true });
        const { page } = this.state;
        const newPage = page + 1;
        this.loadStars(newPage);
      }
    }
  };

  refreshList = () => {
    const page = 1;
    this.setState({
      stars: [],
      page,
      refreshing: true,
    });
    this.loadStars(page);
  };

  handleNavigate = repository => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repository });
  };

  async loadStars(page) {
    try {
      const { navigation } = this.props;
      const user = navigation.getParam('user');
      const { stars } = this.state;

      const response = await api.get(`/users/${user.login}/starred`, {
        params: { page },
      });

      if (response.data.lenght < 30) {
        this.setState({ noMore: true });
      }

      this.setState({
        stars: [...stars, ...response.data],
        page,
        loading: false,
        loadingMore: false,
        refreshing: false,
      });
    } catch {
      this.setState({
        stars: [],
        loading: false,
        loadingMore: false,
        page: 1,
        refreshing: false,
      });
    }
  }

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing, loadingMore, noMore } = this.state;

    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {loading ? (
          <Loading>
            <ActivityIndicator color="#7159c1" size="large" />
          </Loading>
        ) : (
          <Stars
            data={stars}
            onRefresh={this.refreshList} // Função dispara quando o usuário arrasta a lista pra baixo
            refreshing={refreshing} // Variável que armazena um estado true/false que representa se a lista está atualizando
            onEndReachedThreshold={0.2} // Carrega mais itens quando chegar em 20% do fim
            onEndReached={this.loadMore} // Função que carrega mais itens
            keyExtractor={star => String(star.id)}
            renderItem={({ item }) => (
              <Starred onPress={() => this.handleNavigate(item)}>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title> {item.name} </Title>
                  <Author> {item.owner.login} </Author>
                </Info>
              </Starred>
            )}
          />
        )}
        {loadingMore && !noMore && (
          <Loading>
            <ActivityIndicator color="#7159c1" size="small" />
          </Loading>
        )}
      </Container>
    );
  }
}
