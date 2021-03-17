pragma solidity >=0.7.0 <0.8.0;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

contract Share is ERC20 {
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) public {
    }

    function mint(address _investor) external {
        _mint(_investor, 100000 * 10 ** uint(decimals()));
    }

}