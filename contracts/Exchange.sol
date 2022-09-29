//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

import "hardhat/console.sol";
import "./Token.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Exchange is Ownable {
    address public feeAccount;
    uint256 public feePercent;

    address constant ETHER = address(0);

    mapping(address => mapping(address => uint256)) public balances;

    uint256 public traderCount;
    uint256 public orderCount;
    mapping(uint256 => Order) public orders;

    struct Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
        bool isCancelled;
        bool isFilled;
    }

    // Events
    event DepositEvent(
        address token,
        address user,
        uint256 amount,
        uint256 balance,
        uint256 timestamp
    );
    event WithdrawalEvent(
        address token,
        address user,
        uint256 amount,
        uint256 balance,
        uint256 timestamp
    );
    event MakeOrderEvent(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event CancelOrderEvent(uint256 id, address user, uint256 timestamp);
    event TradeEvent(
        uint256 id,
        address trader,
        address orderUser,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    // methods
    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositEther() public payable {
        require(msg.value > 0, "Amount must be greater than 0");
        balances[ETHER][msg.sender] += msg.value;
        emit DepositEvent(
            ETHER,
            msg.sender,
            msg.value,
            balances[ETHER][msg.sender],
            block.timestamp
        );
    }

    function withdrawEther(uint256 _amount) public {
        require(_amount > 0, "Amount must be greater than 0");
        require(
            _amount <= balances[ETHER][msg.sender],
            "Amount must be less than or equal to ether balance"
        );
        balances[ETHER][msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
        emit WithdrawalEvent(
            ETHER,
            msg.sender,
            _amount,
            balances[ETHER][msg.sender],
            block.timestamp
        );
    }

    function depositToken(address _token, uint256 _amount) public {
        require(
            _token != ETHER,
            "No ether should be sent with this transaction"
        );
        require(_amount > 0, "Amount must be greater than 0");
        require(
            Token(_token).transferFrom(msg.sender, address(this), _amount),
            "Depositing of token failed"
        );
        balances[_token][msg.sender] += _amount;
        emit DepositEvent(
            _token,
            msg.sender,
            _amount,
            balances[_token][msg.sender],
            block.timestamp
        );
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(_amount > 0, "Amount must be greater than 0");
        require(
            _token != ETHER,
            "No ether should withdrawn with this transaction"
        );
        require(
            _amount <= balances[_token][msg.sender],
            "Amount must be less than or equal to token balance"
        );
        balances[_token][msg.sender] -= _amount;
        require(
            Token(_token).transfer(msg.sender, _amount),
            "Withdrawing of token failed"
        );

        emit WithdrawalEvent(
            _token,
            msg.sender,
            _amount,
            balances[_token][msg.sender],
            block.timestamp
        );
    }

    function balanceOf(address _token, address _user)
        public
        view
        returns (uint256 balance)
    {
        return balances[_token][_user];
    }

    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {
        orderCount += 1;
        Order memory order = Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp,
            false,
            false
        );
        orders[orderCount] = order;
        emit MakeOrderEvent(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }

    function cancelOrder(uint256 _orderId) public {
        require(
            msg.sender == orders[_orderId].user,
            "Only user can cancel order"
        );
        require(
            !orders[_orderId].isCancelled,
            "Order has already been cancelled"
        );
        require(!orders[_orderId].isFilled, "Order has already been filled");
        orders[_orderId].isCancelled = true;

        emit CancelOrderEvent(_orderId, msg.sender, block.timestamp);
    }

    function _trade(
        uint256 _orderId,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) internal {
        Order storage order = orders[_orderId];
        require(order.isCancelled == false, "Order has been cancelled");
        require(order.isFilled == false, "Order has been filled");

        address orderUser = order.user;
        address trader = msg.sender;

        // order creator has enough balance
        require(
            balances[_tokenGet][orderUser] >= _amountGet,
            "Insufficient funds from order user"
        );

        // trader has enough balance
        require(
            balances[_tokenGive][trader] >= _amountGive,
            "Insufficient funds from trader"
        );

        uint256 _feeAmount = (_amountGet * feePercent) / 100;
        balances[_tokenGet][feeAccount] += _feeAmount;

        balances[_tokenGive][trader] -= _amountGive;
        balances[_tokenGive][orderUser] += _amountGive;

        balances[_tokenGet][orderUser] -= _amountGet;
        balances[_tokenGet][trader] += (_amountGet - _feeAmount);

        traderCount += 1;
        emit TradeEvent(
            _orderId,
            trader,
            orderUser,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }

    function fillOrder(uint256 _orderId) public {
        Order storage order = orders[_orderId];

        _trade(
            order.id,
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive
        );
    }

    function chargeFee() public {}

    fallback() external {
        revert();
    }
}
