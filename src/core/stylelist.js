var getNextBreak = function() {
  /**
   * 计算两点间间距
   * @param  {Array} p1 第一个点
   * @param  {Array} p2 第二个点
   * @return {number}    两点间间距
   */
  function distanceBetween( p1, p2 ) {
    return Math.sqrt(Math.pow(Math.abs( p1[0] - p2[0] ), 2) + Math.pow(Math.abs( p1[1] - p2[1] ), 2));
  }
  /**
   * 计算在线段p1p2上距离p1距离为delta的点
   * @param  {[type]} p1    [description]
   * @param  {[type]} p2    [description]
   * @param  {[type]} delta [description]
   * @return {[type]}       [description]
   */
  function c( p1, p2, delta ) {
    var d = distanceBetween( p1, p2 );
    var ratio = delta / d;
    var dx = p2[0] - p1[0];
    var dy = p2[1] - p1[1];
    if( isNaN( dx ) || isNaN( dy ) || isNaN( ratio ) || isNaN( d ) ) {
      debugger
    }
    return [ p1[0] + dx * ratio, p1[1] + dy * ratio ];
  }

  /**
   * 计算下一个断点
   * @param  {Array} first 代表上一个断点的数组
   * @param  {number} delta 断点之间的间距
   * @param  {Array} polyLine 代表多段线的数组（剩余的多段线，已经分割好的就不传进来了）
   * @return {Array|Boolean}       下一个断点，如果已经没办法再分一次的话，返回 false
   */
  return function ( first, delta, polyLine ) {

    // 如果下一个断点在polyLine[0]和first之间
    var distance = distanceBetween( first, polyLine[ 0 ] );
    if( distance > delta ) {
      return c( first, polyLine[0], delta );
    }

    // 保存到first的长度刚刚大于delta的点的索引
    var index = 0;
    var distanceOld = 0;

    while ( distance < delta ) {
      // 如果已经到最后了，还不够分一次的话，返回 false
      if( !polyLine[ index + 1 ] ) return false;
      distanceOld = distance;
      distance += distanceBetween( polyLine[ index ], polyLine[ ++index ] )
    }

    var p1 = polyLine[ index -1 ];
    var p2 = polyLine[ index ];
    var d = delta - distanceOld;

    // 去掉已经分段好的部分
    polyLine.splice( 0, index );

    return c( p1, p2, d );



  }
}()
