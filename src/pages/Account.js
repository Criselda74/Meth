import React from "react";
import store from "../lib/store";
import products from "../lib/products.json";
import { BidReceived } from "../components/pure/BidReceived";
import { BidSent } from "../components/pure/BidSent";
import { ProductCard } from "../components/pure/ProductCard";
import { DecryptModal } from "../components/containers/DecryptModal";
import { VerifyModal } from "../components/containers/VerifyModal";
import { ConfirmBidModal } from "../components/containers/ConfirmBidModal";

const VIEWS = {
  HODL: "HODL",
  SENT: "SENT",
  RECEIVED: "RECEIVED"
};
export class AccountPage extends React.Component {
  constructor(props) {
    super(props);
    let { userId } = store.account;
    let user = store.users[userId];
    let sent = store.bids.filter(x => x.sender === userId);
    let received = store.bids.filter(x => x.receiver === userId);
    let hodl = (user.hodl || []).map(x => {
      let product = products.find(p => `${p.id}` === `${x}`) || null;
      if (product === null) return null;
      return { ...product, decrypted: false, isLoading: false, isVerified: false };
    });
    this.state = {
      decryptModalOpen: false,
      confirmModalOpen: false,
      verifyModalOpen: false,
      userId,
      user,
      sent,
      hodl,
      received,
      currentView: VIEWS.HODL
    };
    this.decrypting = null;
    this.verifying = null;
    this._onDecryptionSuccess = this._onDecryptionSuccess.bind(this);
  }

  _onDecryptionSuccess() {
    let productId = this.decrypting;
    let hodl = this.state.hodl.map(x => {
      if (x.id === productId) return { ...x, decrypted: true, isLoading: false };
      else return x;
    });
    this.decrypting = null;
    this.setState({ hodl, decryptModalOpen: false });
  }

  _onVerifySuccess() {
    let productId = this.verifying;
    let hodl = this.state.hodl.map(x => {
      if (x.id === productId) return { ...x, verified: true, isLoading: false };
      else return x;
    });
    this.verifying = null;
    this.setState({ hodl, verifyModalOpen: false });
  }

  _onSaleSuccess() {
    this.setState({ confirmModalOpen: false });
  }

  _closeAllModals() {
    let hodl = this.state.hodl.map(x => ({...x, isLoading: false}))
    this.setState({
      hodl,
      decryptModalOpen: false,
      confirmModalOpen: false,
      verifyModalOpen: false,
    })
  }

  _renderHodlList(hodl) {
    return hodl.map(product => {
      return (
        <div className="columns small-6 medium-3" key={`hodl.${product.id}`}>
          <button
            className="button expanded"
            onClick={() => this._decrypt(product.id)}
          >
            Unlock
          </button>
          <button
            className="button secondary expanded"
            onClick={() => this._verify(product.id)}
          >
            Verify
          </button>
          <ProductCard
            id={product.id}
            url={product.thumb}
            title={product.title}
            decrypted={product.decrypted}
            isLoading={product.isLoading}
          />
        </div>
      );
    });
  }

  _renderReceivedList(received) {
    return received.map(bid => {
      let product =
        products.find(p => `${p.id}` === `${bid.productId}`) || null;
      if (product === null) return null;
      return (
        <BidReceived
          id={bid.id}
          title={product.title}
          key={bid.id}
          thumb={product.thumb}
          wei={bid.wei}
          onAccept={() => {
            this._confirmBid(bid.id)
          }}
          onDecline={() => {
            alert("Declined");
          }}
        />
      );
    });
  }

  _renderSentList(sent) {
    return sent.map(bid => {
      let product =
        products.find(p => `${p.id}` === `${bid.productId}`) || null;
      if (product === null) return null;
      return (
        <BidSent
          id={bid.id}
          title={product.title}
          key={bid.id}
          thumb={product.thumb}
          wei={bid.wei}
        />
      );
    });
  }

  _decrypt(productId) {
    this.decrypting = productId;
    let hodl = this.state.hodl.map(x => {
      if (x.id === productId) return {...x, isLoading: true}
      else return x
    })
    this.setState({ hodl, decryptModalOpen: true });
  }

  _confirmBid(bidId) {
    this.setState({ confirmModalOpen: true });
  }

  _verify(productId) {
    this.setState({ verifyModalOpen: true });
  }


  render() {
    const {
      hodl,
      sent,
      received,
      currentView,
      decryptModalOpen,
      confirmModalOpen,
      verifyModalOpen
    } = this.state;

    let HodlList = this._renderHodlList(hodl);
    let SentList = this._renderSentList(sent);
    let ReceivedList = this._renderReceivedList(received);

    return (
      <div id="AccountPage">
        <DecryptModal
          isOpen={decryptModalOpen}
          onSuccess={() => this._onDecryptionSuccess()}
          onClose={() => this._closeAllModals()}
        />
        <ConfirmBidModal
          isOpen={confirmModalOpen}
          onSuccess={() => this._onSaleSuccess()}
          onClose={() => this._closeAllModals()}
        />
        <VerifyModal
          isOpen={verifyModalOpen}
          onClose={() => this._closeAllModals()}
          onSuccess={() => this._onVerifySuccess()}
        />

        <div class="expanded">
        <div className="row row--section">
          <div className="columns large-6">
            <h5>My Dashboard</h5>
          </div>
          <div className="columns large-6 text-right">
            <p class="h5">
              <span className="text-light">Balance </span>
              <b>0.234 ETH</b>
            </p>
            <span class="h1"><i class="fas fa-wallet"></i></span>
          </div>
        </div>
        </div>

        <div class="expanded">
        <div className="row">
          <div className="columns large-12">
            <div className="button-group button-group--underline">
              <button
                onClick={() => {
                  this.setState({ currentView: VIEWS.HODL });
                }}
                className={
                  currentView === VIEWS.HODL
                    ? "button button--active"
                    : "button secondary hollow"
                }
              >
                Images you HODL
              </button>
              <button
                onClick={() => {
                  this.setState({ currentView: VIEWS.SENT });
                }}
                className={
                  currentView === VIEWS.SENT
                    ? "button button--active"
                    : "button secondary hollow"
                }
              >
                Bids Sent
              </button>
              <button
                onClick={() => {
                  this.setState({ currentView: VIEWS.RECEIVED });
                }}
                className={
                  currentView === VIEWS.RECEIVED
                    ? "button button--active"
                    : "button secondary hollow"
                }
              >
                Bids Received
              </button>

              <button className="button secondary hollow text-right">
                <i className="fas fa-cog" /> Settings
              </button>
            </div>
          </div>
        </div>
        </div>

        {currentView === VIEWS.HODL && (
          <div>
            <div className="row align-stretch">
              <div className="columns large-12">
                <p style={{ marginTop: 32, marginBottom: 32 }}>You hodl {sent.length} items.</p>
              </div>
            </div>

            <div className="row align-stretch">{HodlList}</div>
          </div>
        )}

        {currentView === VIEWS.SENT && (
          <div>
            <div className="row align-stretch">
              <div className="columns large-12">
                <p style={{ marginTop: 48, marginBottom: 16 }}>
                  You have sent {sent.length} bids.
                </p>
              </div>
            </div>
            {SentList}
          </div>
        )}

        {currentView === VIEWS.RECEIVED && (
          <div>
            <div className="row align-stretch">
              <div className="columns large-12">
                <p style={{ marginTop: 48, marginBottom: 16 }}>
                  You have received {received.length} bids.
                </p>
              </div>
              <div className="columns large-12">{ReceivedList}</div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
