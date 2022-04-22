CREATE 
    ALGORITHM = UNDEFINED 
    DEFINER = `root`@`localhost` 
    SQL SECURITY DEFINER
VIEW `vi_getdbschema` AS
    SELECT 
        `information_schema`.`tab`.`TABLE_SCHEMA` AS `database_schema`,
        `information_schema`.`tab`.`TABLE_NAME` AS `table_name`,
        `information_schema`.`col`.`ORDINAL_POSITION` AS `column_id`,
        `information_schema`.`col`.`COLUMN_NAME` AS `column_name`,
        `information_schema`.`col`.`DATA_TYPE` AS `data_type`,
        (CASE
            WHEN (`information_schema`.`col`.`NUMERIC_PRECISION` IS NOT NULL) THEN `information_schema`.`col`.`NUMERIC_PRECISION`
            ELSE `information_schema`.`col`.`CHARACTER_MAXIMUM_LENGTH`
        END) AS `max_length`,
        (CASE
            WHEN (`information_schema`.`col`.`DATETIME_PRECISION` IS NOT NULL) THEN `information_schema`.`col`.`DATETIME_PRECISION`
            WHEN (`information_schema`.`col`.`NUMERIC_SCALE` IS NOT NULL) THEN `information_schema`.`col`.`NUMERIC_SCALE`
            ELSE 0
        END) AS `precision`
    FROM
        (`information_schema`.`TABLES` `tab`
        JOIN `information_schema`.`COLUMNS` `col` ON (((`information_schema`.`col`.`TABLE_SCHEMA` = `information_schema`.`tab`.`TABLE_SCHEMA`)
            AND (`information_schema`.`col`.`TABLE_NAME` = `information_schema`.`tab`.`TABLE_NAME`))))
    WHERE
        ((`information_schema`.`tab`.`TABLE_TYPE` = 'BASE TABLE')
            AND (`information_schema`.`tab`.`TABLE_SCHEMA` NOT IN ('information_schema' , 'mysql', 'performance_schema', 'sys'))
            AND (`information_schema`.`tab`.`TABLE_SCHEMA` = DATABASE()))
    ORDER BY `information_schema`.`tab`.`TABLE_NAME` , `information_schema`.`col`.`ORDINAL_POSITION`