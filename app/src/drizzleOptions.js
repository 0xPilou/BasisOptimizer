import OptimizerFactory from './contracts/OptimizerFactory.json'
import LP from './contracts/LP.json'
import Share from './contracts/Share.json'
import Dollar from './contracts/Dollar.json'
import ShareRewardPoolMock from './contracts/ShareRewardPoolMock.json'
import BoardroomMock from './contracts/BoardroomMock.json'

const options = {
    contracts: [
        OptimizerFactory,
        LP,
        Share,
        Dollar,
        ShareRewardPoolMock,
        BoardroomMock],
    web3: {
        fallback: {
            type: "ws",
            url: "ws://127.0.0.1:9545",
        },
    }
};

export default options