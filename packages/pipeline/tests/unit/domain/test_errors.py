from src.domain.errors import ErrorCollector

_COLUMNS = [
    "source",
    "level",
    "type",
    "date",
    "account",
    "isin",
    "ticker",
    "name",
    "message",
]


def test_to_df_empty_collector_returns_empty_frame_with_columns():
    df = ErrorCollector().to_df()

    assert df.empty
    assert list(df.columns) == _COLUMNS


def test_add_fills_optional_fields_with_empty_string_defaults():
    collector = ErrorCollector()

    collector.add(
        source="fetch_prices",
        level="warning",
        type="unresolved_asset",
        message="no match",
    )

    row = collector.to_df().iloc[0]
    assert row["source"] == "fetch_prices"
    assert row["level"] == "warning"
    assert row["type"] == "unresolved_asset"
    assert row["message"] == "no match"
    assert row["date"] == ""
    assert row["account"] == ""
    assert row["isin"] == ""
    assert row["ticker"] == ""
    assert row["name"] == ""


def test_to_df_column_order_is_fixed_regardless_of_kwarg_order():
    collector = ErrorCollector()
    collector.add(message="m", type="t", level="error", source="s", isin="FR1")

    assert list(collector.to_df().columns) == _COLUMNS


def test_len_counts_number_of_errors_added():
    collector = ErrorCollector()
    assert len(collector) == 0

    collector.add(source="a", level="error", type="t", message="m1")
    collector.add(source="b", level="warning", type="t", message="m2")

    assert len(collector) == 2


def test_to_df_preserves_insertion_order():
    collector = ErrorCollector()
    collector.add(source="a", level="error", type="t1", message="m1")
    collector.add(source="b", level="warning", type="t2", message="m2")

    df = collector.to_df()

    assert df["source"].tolist() == ["a", "b"]
    assert df["type"].tolist() == ["t1", "t2"]
